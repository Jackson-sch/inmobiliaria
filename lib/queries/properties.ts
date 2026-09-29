import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Property, PropertyFilters } from "@/types";

export interface PropertyListResult {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 12;

/**
 * Lista propiedades públicas (status != 'inactivo' vía RLS) aplicando los
 * filtros del catálogo. Trae la imagen de portada de cada propiedad en la
 * misma consulta para evitar el problema N+1 en el listado.
 */
export async function getProperties(
  filters: PropertyFilters = {}
): Promise<PropertyListResult> {
  const supabase = await createSupabaseServerClient();

  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("properties")
    .select(
      `
      id, agent_id, title, slug, description, type, operation, status,
      price, currency, address, district, city, latitude, longitude,
      land_area_m2, built_area_m2, bedrooms, bathrooms, parking_spots,
      floors, year_built, featured, views_count, created_at, updated_at,
      images:property_images(id, secure_url, is_cover, sort_order)
      `,
      { count: "exact" }
    )
    .neq("status", "inactivo")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.type) query = query.eq("type", filters.type);
  if (filters.operation) query = query.eq("operation", filters.operation);
  if (filters.district) query = query.eq("district", filters.district);
  if (filters.currency) query = query.eq("currency", filters.currency);
  if (filters.bedrooms) query = query.gte("bedrooms", filters.bedrooms);
  if (filters.bathrooms) query = query.gte("bathrooms", filters.bathrooms);
  if (filters.priceMin) query = query.gte("price", filters.priceMin);
  if (filters.priceMax) query = query.lte("price", filters.priceMax);
  if (filters.areaMin) query = query.gte("built_area_m2", filters.areaMin);
  if (filters.featured) query = query.eq("featured", true);
  if (filters.query) {
    const q = filters.query.trim();
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,address.ilike.%${q}%,district.ilike.%${q}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Error al listar propiedades: ${error.message}`);
  }

  const properties: Property[] = (data ?? []).map((row: any) => ({
    id: row.id,
    agentId: row.agent_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    type: row.type,
    operation: row.operation,
    status: row.status,
    price: row.price,
    currency: row.currency,
    address: row.address,
    district: row.district,
    city: row.city,
    latitude: row.latitude,
    longitude: row.longitude,
    landAreaM2: row.land_area_m2,
    builtAreaM2: row.built_area_m2,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    parkingSpots: row.parking_spots,
    floors: row.floors,
    yearBuilt: row.year_built,
    featured: row.featured,
    viewsCount: row.views_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    images: (row.images ?? [])
      .map((img: any) => ({
        id: img.id,
        propertyId: row.id,
        cloudinaryPublicId: img.cloudinary_public_id ?? "",
        secureUrl: img.secure_url ?? "",
        width: img.width ?? null,
        height: img.height ?? null,
        format: img.format ?? null,
        isCover: img.is_cover ?? false,
        sortOrder: img.sort_order ?? 0,
        createdAt: img.created_at ?? "",
      }))
      .sort((a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder),
  }));

  const total = count ?? 0;

  return {
    properties,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Trae una propiedad por slug con todas sus relaciones (imágenes, amenidades,
 * agente), para la página de detalle.
 */
export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      id, agent_id, title, slug, description, type, operation, status,
      price, currency, address, district, city, latitude, longitude,
      land_area_m2, built_area_m2, bedrooms, bathrooms, parking_spots,
      floors, year_built, featured, views_count, created_at, updated_at,
      images:property_images(id, secure_url, cloudinary_public_id, width, height, format, is_cover, sort_order, created_at),
      amenities:property_amenities(amenity:amenities(id, name, icon)),
      agent:agents(id, full_name, phone, whatsapp, email, avatar_url, facebook_url, instagram_url)
      `
    )
    .eq("slug", slug)
    .neq("status", "inactivo")
    .maybeSingle();

  if (error) {
    throw new Error(`Error al obtener la propiedad: ${error.message}`);
  }
  if (!data) return null;

  const row = data as any;

  return {
    id: row.id,
    agentId: row.agent_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    type: row.type,
    operation: row.operation,
    status: row.status,
    price: row.price,
    currency: row.currency,
    address: row.address,
    district: row.district,
    city: row.city,
    latitude: row.latitude,
    longitude: row.longitude,
    landAreaM2: row.land_area_m2,
    builtAreaM2: row.built_area_m2,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    parkingSpots: row.parking_spots,
    floors: row.floors,
    yearBuilt: row.year_built,
    featured: row.featured,
    viewsCount: row.views_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    images: (row.images ?? [])
      .map((img: any) => ({
        id: img.id,
        propertyId: row.id,
        cloudinaryPublicId: img.cloudinary_public_id,
        secureUrl: img.secure_url,
        width: img.width,
        height: img.height,
        format: img.format,
        isCover: img.is_cover,
        sortOrder: img.sort_order,
        createdAt: img.created_at,
      }))
      .sort((a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder),
    amenities: (row.amenities ?? []).map((rel: any) => rel.amenity),
    agent: row.agent
      ? {
          id: row.agent.id,
          fullName: row.agent.full_name,
          phone: row.agent.phone,
          whatsapp: row.agent.whatsapp,
          email: row.agent.email,
          bio: null,
          avatarUrl: row.agent.avatar_url,
          facebookUrl: row.agent.facebook_url,
          instagramUrl: row.agent.instagram_url,
          createdAt: "",
          updatedAt: "",
        }
      : undefined,
  };
}

/** Lista de distritos distintos con propiedades publicadas, para el filtro. */
export async function getAvailableDistricts(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("district")
    .neq("status", "inactivo");

  if (error) throw new Error(error.message);

  return Array.from(new Set((data ?? []).map((row) => row.district))).sort();
}

/** Obtiene slugs y fechas de modificación para el sitemap dinámico. */
export async function getPropertiesForSitemap(): Promise<Array<{ slug: string; updatedAt: string }>> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("properties")
      .select("slug, updated_at")
      .neq("status", "inactivo");

    if (error || !data) return [];

    return data.map((row) => ({
      slug: row.slug,
      updatedAt: row.updated_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

