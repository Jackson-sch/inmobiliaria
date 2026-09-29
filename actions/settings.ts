"use server";

import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export async function getCloudinarySettings(): Promise<CloudinaryConfig> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("system_settings")
    .select("key, value")
    .in("key", ["cloudinary_cloud_name", "cloudinary_api_key", "cloudinary_api_secret"]);

  const map: Record<string, string> = {};
  data?.forEach((row) => {
    map[row.key] = row.value;
  });

  return {
    cloudName: map["cloudinary_cloud_name"] || process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: map["cloudinary_api_key"] || process.env.CLOUDINARY_API_KEY || "",
    apiSecret: map["cloudinary_api_secret"] || process.env.CLOUDINARY_API_SECRET || "",
  };
}

export async function saveCloudinarySettings(config: CloudinaryConfig) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autorizado. Inicia sesión como administrador." };
  }

  const rows = [
    { key: "cloudinary_cloud_name", value: config.cloudName.trim(), description: "Cloudinary Cloud Name" },
    { key: "cloudinary_api_key", value: config.apiKey.trim(), description: "Cloudinary API Key" },
    { key: "cloudinary_api_secret", value: config.apiSecret.trim(), description: "Cloudinary API Secret" },
  ];

  for (const row of rows) {
    const { error } = await supabase
      .from("system_settings")
      .upsert(row, { onConflict: "key" });

    if (error) {
      return { success: false, error: `Error al guardar ${row.key}: ${error.message}` };
    }
  }

  revalidatePath("/admin/configuracion");
  return { success: true };
}

export async function testCloudinaryConnection(config: CloudinaryConfig) {
  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    return { success: false, error: "Todos los campos de Cloudinary son requeridos para probar la conexión." };
  }

  try {
    cloudinary.config({
      cloud_name: config.cloudName.trim(),
      api_key: config.apiKey.trim(),
      api_secret: config.apiSecret.trim(),
      secure: true,
    });

    const ping = await cloudinary.api.ping();
    if (ping && ping.status === "ok") {
      return { success: true, message: "¡Conexión con Cloudinary exitosa! Las credenciales son válidas." };
    }
    return { success: false, error: "Cloudinary no respondió con status 'ok'." };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Error al autenticar con Cloudinary. Revisa tu Cloud Name, API Key y API Secret.",
    };
  }
}

// ============================================================
// Configuración de Notificaciones por Telegram (Leads Instantáneos)
// ============================================================
export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export async function getTelegramSettings(): Promise<TelegramConfig> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("get_telegram_config_secure", {
    secret_key: "inmobiliaria_internal_secret_998877",
  });

  const row = Array.isArray(data) ? data[0] : null;

  return {
    botToken: row?.bot_token || process.env.TELEGRAM_BOT_TOKEN || "",
    chatId: row?.chat_id || process.env.TELEGRAM_CHAT_ID || "",
  };
}

export async function saveTelegramSettings(config: TelegramConfig) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autorizado. Inicia sesión como administrador." };
  }

  const rows = [
    { key: "telegram_bot_token", value: config.botToken.trim(), description: "Token del Bot de Telegram" },
    { key: "telegram_chat_id", value: config.chatId.trim(), description: "ID de Chat/Canal de Telegram" },
  ];

  for (const row of rows) {
    const { error } = await supabase
      .from("system_settings")
      .upsert(row, { onConflict: "key" });

    if (error) {
      return { success: false, error: `Error al guardar ${row.key}: ${error.message}` };
    }
  }

  revalidatePath("/admin/configuracion");
  return { success: true };
}

export async function testTelegramNotification(config: TelegramConfig) {
  if (!config.botToken || !config.chatId) {
    return { success: false, error: "Ingresa el Bot Token y el Chat ID para enviar el mensaje de prueba." };
  }

  try {
    const endpoint = `https://api.telegram.org/bot${config.botToken.trim()}/sendMessage`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId.trim(),
        text: `🔔 *Prueba de Alerta Inmobiliaria*\n\n¡Configuración correcta! Recibirás aquí cada consulta de clientes de la web Jean Mendocilla.`,
        parse_mode: "Markdown",
      }),
    });

    const json = await res.json();
    if (json.ok) {
      return { success: true, message: "¡Mensaje de prueba enviado exitosamente a tu Telegram!" };
    } else {
      return { success: false, error: `Telegram respondió: ${json.description || "Error desconocido"}` };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Error al conectar con la API de Telegram." };
  }
}

// ============================================================
// Configuración de Datos de Contacto y Redes Sociales del Asesor
// ============================================================
export interface ContactAndSocialConfig {
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
  mvcsNumber: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
}

export async function getContactAndSocialSettings(): Promise<ContactAndSocialConfig> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("system_settings")
    .select("key, value")
    .in("key", [
      "contact_full_name",
      "contact_phone",
      "contact_whatsapp",
      "contact_email",
      "contact_mvcs_number",
      "social_facebook",
      "social_instagram",
      "social_tiktok",
      "social_linkedin",
      "social_youtube",
    ]);

  const map: Record<string, string> = {};
  data?.forEach((row) => {
    map[row.key] = row.value;
  });

  return {
    fullName: map["contact_full_name"] || "Jean Mendocilla",
    phone: map["contact_phone"] || "+51 900 000 000",
    whatsapp: map["contact_whatsapp"] || "+51 900 000 000",
    email: map["contact_email"] || "contacto@jeanmendocilla.pe",
    mvcsNumber: map["contact_mvcs_number"] || "PN-14285",
    facebookUrl:
      map["social_facebook"] ||
      "https://www.facebook.com/jean.mendocillasebastian",
    instagramUrl: map["social_instagram"] || "",
    tiktokUrl: map["social_tiktok"] || "",
    linkedinUrl: map["social_linkedin"] || "",
    youtubeUrl: map["social_youtube"] || "",
  };
}

export async function saveContactAndSocialSettings(config: ContactAndSocialConfig) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autorizado. Inicia sesión como administrador." };
  }

  const rows = [
    { key: "contact_full_name", value: config.fullName.trim(), description: "Nombre del Asesor / Inmobiliaria" },
    { key: "contact_phone", value: config.phone.trim(), description: "Teléfono de contacto" },
    { key: "contact_whatsapp", value: config.whatsapp.trim(), description: "Número de WhatsApp oficial" },
    { key: "contact_email", value: config.email.trim(), description: "Correo electrónico oficial" },
    { key: "contact_mvcs_number", value: config.mvcsNumber.trim(), description: "Número de Registro MVCS" },
    { key: "social_facebook", value: config.facebookUrl.trim(), description: "Enlace a perfil o página de Facebook" },
    { key: "social_instagram", value: config.instagramUrl.trim(), description: "Enlace a perfil de Instagram" },
    { key: "social_tiktok", value: config.tiktokUrl.trim(), description: "Enlace a cuenta de TikTok" },
    { key: "social_linkedin", value: config.linkedinUrl.trim(), description: "Enlace a perfil de LinkedIn" },
    { key: "social_youtube", value: config.youtubeUrl.trim(), description: "Enlace a canal de YouTube" },
  ];

  for (const row of rows) {
    const { error } = await supabase
      .from("system_settings")
      .upsert(row, { onConflict: "key" });

    if (error) {
      return { success: false, error: `Error al guardar ${row.key}: ${error.message}` };
    }
  }

  // Sincronizar también con la tabla agents
  await supabase
    .from("agents")
    .update({
      full_name: config.fullName.trim(),
      phone: config.phone.trim(),
      whatsapp: config.whatsapp.trim(),
      email: config.email.trim(),
      facebook_url: config.facebookUrl.trim() || null,
      instagram_url: config.instagramUrl.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Actualiza los agentes existentes

  revalidatePath("/");
  revalidatePath("/propiedades");
  revalidatePath("/admin/configuracion");
  return { success: true };
}
