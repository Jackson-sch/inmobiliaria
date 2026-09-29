"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { leadFormSchema, type LeadFormValues, type ActionResult } from "@/types";

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
