"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteCloudinaryFolder, deleteCloudinaryImage } from "@/lib/cloudinary";
import {
  propertyFormSchema,
  leadFormSchema,
  type PropertyFormValues,
  type LeadFormValues,
  type NewPropertyImageInput,
} from "@/types";

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function requireAuthenticatedAgent() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autorizado. Debes iniciar sesión.");
  }

  return { supabase, userId: user.id };
}

// ============================================================
// Crear propiedad
// ============================================================
export async function createProperty(
  agentId: string,
  input: PropertyFormValues
): Promise<ActionResult<{ id: string; slug: string }>> {
  const parsed = propertyFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { supabase } = await requireAuthenticatedAgent();
  const data = parsed.data;

  const baseSlug = slugify(data.title);
  let slug = baseSlug;
  let attempt = 0;

  // Garantiza slug único agregando un sufijo si ya existe
  while (true) {
    const { data: existing } = await supabase
      .from("properties")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing) break;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const { amenityIds, ...propertyData } = data;

  const { data: property, error } = await supabase
    .from("properties")
    .insert({
      agent_id: agentId,
      title: propertyData.title,
      slug,
      description: propertyData.description,
      type: propertyData.type,
      operation: propertyData.operation,
      status: propertyData.status,
      price: propertyData.price,
      currency: propertyData.currency,
      address: propertyData.address ?? null,
      district: propertyData.district,
      city: propertyData.city,
      latitude: propertyData.latitude ?? null,
      longitude: propertyData.longitude ?? null,
      land_area_m2: propertyData.landAreaM2 ?? null,
      built_area_m2: propertyData.builtAreaM2 ?? null,
      bedrooms: propertyData.bedrooms ?? null,
      bathrooms: propertyData.bathrooms ?? null,
      parking_spots: propertyData.parkingSpots,
      floors: propertyData.floors ?? null,
      year_built: propertyData.yearBuilt ?? null,
      featured: propertyData.featured,
    })
    .select("id, slug")
    .single();

  if (error || !property) {
    return { success: false, error: error?.message ?? "Error al crear la propiedad" };
  }

  if (amenityIds && amenityIds.length > 0) {
    const rows = amenityIds.map((amenityId) => ({
      property_id: property.id,
      amenity_id: amenityId,
    }));
    const { error: amenitiesError } = await supabase
      .from("property_amenities")
      .insert(rows);

    if (amenitiesError) {
      return { success: false, error: amenitiesError.message };
    }
  }

  revalidatePath("/propiedades");
  revalidatePath("/admin/propiedades");

  return { success: true, data: { id: property.id, slug: property.slug } };
}

// ============================================================
// Actualizar propiedad
// ============================================================
export async function updateProperty(
  propertyId: string,
  input: PropertyFormValues
): Promise<ActionResult<{ id: string; slug: string }>> {
  const parsed = propertyFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { supabase } = await requireAuthenticatedAgent();
  const { amenityIds, ...propertyData } = parsed.data;

  const { data: property, error } = await supabase
    .from("properties")
    .update({
      title: propertyData.title,
      description: propertyData.description,
      type: propertyData.type,
      operation: propertyData.operation,
      status: propertyData.status,
      price: propertyData.price,
      currency: propertyData.currency,
      address: propertyData.address ?? null,
      district: propertyData.district,
      city: propertyData.city,
      latitude: propertyData.latitude ?? null,
      longitude: propertyData.longitude ?? null,
      land_area_m2: propertyData.landAreaM2 ?? null,
      built_area_m2: propertyData.builtAreaM2 ?? null,
      bedrooms: propertyData.bedrooms ?? null,
      bathrooms: propertyData.bathrooms ?? null,
      parking_spots: propertyData.parkingSpots,
      floors: propertyData.floors ?? null,
      year_built: propertyData.yearBuilt ?? null,
      featured: propertyData.featured,
    })
    .eq("id", propertyId)
    .select("id, slug")
    .single();

  if (error || !property) {
    return { success: false, error: error?.message ?? "Error al actualizar la propiedad" };
  }

  if (amenityIds) {
    await supabase.from("property_amenities").delete().eq("property_id", propertyId);
    if (amenityIds.length > 0) {
      const rows = amenityIds.map((amenityId) => ({
        property_id: propertyId,
        amenity_id: amenityId,
      }));
      const { error: amenitiesError } = await supabase
        .from("property_amenities")
        .insert(rows);
      if (amenitiesError) {
        return { success: false, error: amenitiesError.message };
      }
    }
  }

  revalidatePath("/propiedades");
  revalidatePath(`/propiedades/${property.slug}`);
  revalidatePath("/admin/propiedades");

  return { success: true, data: { id: property.id, slug: property.slug } };
}

// ============================================================
// Eliminar propiedad (borra también sus imágenes en Cloudinary)
// ============================================================
export async function deleteProperty(propertyId: string): Promise<ActionResult> {
  const { supabase } = await requireAuthenticatedAgent();

  const { error } = await supabase.from("properties").delete().eq("id", propertyId);

  if (error) {
    return { success: false, error: error.message };
  }

  await deleteCloudinaryFolder(propertyId).catch(() => {
    // No bloqueamos la respuesta si Cloudinary falla; queda para limpieza manual/cron.
  });

  revalidatePath("/propiedades");
  revalidatePath("/admin/propiedades");

  return { success: true, data: undefined };
}

// ============================================================
// Agregar imagen (tras la subida directa a Cloudinary desde el cliente)
// ============================================================
export async function addPropertyImage(
  input: NewPropertyImageInput
): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAuthenticatedAgent();

  if (input.isCover) {
    await supabase
      .from("property_images")
      .update({ is_cover: false })
      .eq("property_id", input.propertyId)
      .eq("is_cover", true);
  }

  const { data, error } = await supabase
    .from("property_images")
    .insert({
      property_id: input.propertyId,
      cloudinary_public_id: input.cloudinaryPublicId,
      secure_url: input.secureUrl,
      width: input.width,
      height: input.height,
      format: input.format,
      is_cover: input.isCover,
      sort_order: input.sortOrder,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Error al guardar la imagen" };
  }

  revalidatePath("/admin/propiedades");

  return { success: true, data: { id: data.id } };
}

// ============================================================
// Eliminar imagen (Supabase + Cloudinary)
// ============================================================
export async function deletePropertyImage(imageId: string): Promise<ActionResult> {
  const { supabase } = await requireAuthenticatedAgent();

  const { data: image, error: fetchError } = await supabase
    .from("property_images")
    .select("cloudinary_public_id, property_id")
    .eq("id", imageId)
    .single();

  if (fetchError || !image) {
    return { success: false, error: fetchError?.message ?? "Imagen no encontrada" };
  }

  const { error: deleteError } = await supabase
    .from("property_images")
    .delete()
    .eq("id", imageId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  await deleteCloudinaryImage(image.cloudinary_public_id).catch(() => {
    // Igual que en deleteProperty: no bloqueamos si Cloudinary falla.
  });

  revalidatePath("/admin/propiedades");

  return { success: true, data: undefined };
}

// ============================================================
// Marcar una imagen como portada
// ============================================================
export async function setCoverImage(
  propertyId: string,
  imageId: string
): Promise<ActionResult> {
  const { supabase } = await requireAuthenticatedAgent();

  await supabase
    .from("property_images")
    .update({ is_cover: false })
    .eq("property_id", propertyId)
    .eq("is_cover", true);

  const { error } = await supabase
    .from("property_images")
    .update({ is_cover: true })
    .eq("id", imageId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/propiedades");
  return { success: true, data: undefined };
}

// ============================================================
// Actualizar estado rápido de una propiedad (Admin)
// ============================================================
export async function updatePropertyStatus(
  propertyId: string,
  status: "disponible" | "reservado" | "vendido" | "alquilado" | "inactivo"
): Promise<ActionResult> {
  const { supabase } = await requireAuthenticatedAgent();

  const { error } = await supabase
    .from("properties")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", propertyId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/propiedades");
  return { success: true, data: undefined };
}

// ============================================================
// Registrar un lead (formulario de contacto público, sin auth)
// ============================================================
export async function createLead(input: LeadFormValues): Promise<ActionResult<{ id: string }>> {
  const parsed = leadFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const data = parsed.data;

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      property_id: data.propertyId ?? null,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      message: data.message ?? null,
      source: data.source,
    })
    .select("id")
    .single();

  if (error || !lead) {
    return { success: false, error: error?.message ?? "Error al registrar el contacto" };
  }

  // Notificación instantánea a Telegram
  try {
    let propertyTitle: string | null = null;
    if (data.propertyId) {
      const { data: prop } = await supabase
        .from("properties")
        .select("title")
        .eq("id", data.propertyId)
        .maybeSingle();
      propertyTitle = prop?.title ?? null;
    }

    const { notifyNewLead } = await import("@/lib/notifications/leads");
    await notifyNewLead({
      name: data.name,
      phone: data.phone,
      email: data.email,
      message: data.message,
      propertyTitle,
      source: data.source,
    });
  } catch (e) {
    console.error("Error en notificación de lead:", e);
  }

  revalidatePath("/admin");
  return { success: true, data: { id: lead.id } };
}
