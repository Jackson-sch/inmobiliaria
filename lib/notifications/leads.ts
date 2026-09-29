import { createSupabaseServerClient } from "@/lib/supabase/server";

interface LeadNotificationData {
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  propertyTitle?: string | null;
  source: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function notifyNewLead(lead: LeadNotificationData): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Obtenemos credenciales de Telegram mediante RPC seguro
    const { data: rpcData, error: rpcError } = await supabase.rpc("get_telegram_config_secure", {
      secret_key: "inmobiliaria_internal_secret_998877",
    });

    if (rpcError) {
      console.error("[Telegram] Error al obtener credenciales seguras:", rpcError.message);
    }

    const row = Array.isArray(rpcData) ? rpcData[0] : null;
    const token = row?.bot_token || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = row?.chat_id || process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.warn("[Telegram] Notificación omitida: bot_token o chat_id no configurados en la base de datos.");
      return;
    }

    const cleanPhone = lead.phone.replace(/\D/g, "");
    const waLink = `https://wa.me/${cleanPhone}`;

    const lines = [
      `🔔 <b>Nuevo Lead en la Web Inmobiliaria</b>`,
      ``,
      `👤 <b>Cliente:</b> ${escapeHtml(lead.name)}`,
      `📱 <b>Teléfono:</b> <a href="${waLink}">${escapeHtml(lead.phone)}</a>`,
      lead.email ? `📧 <b>Correo:</b> ${escapeHtml(lead.email)}` : null,
      lead.propertyTitle
        ? `🏠 <b>Inmueble de interés:</b> ${escapeHtml(lead.propertyTitle)}`
        : `🏠 <b>Consulta:</b> General`,
      lead.message ? `💬 <b>Mensaje:</b> &quot;${escapeHtml(lead.message)}&quot;` : null,
      `📍 <b>Canal:</b> ${escapeHtml(lead.source)}`,
      `⏱️ <b>Fecha:</b> ${new Date().toLocaleString("es-PE", { timeZone: "America/Lima" })}`,
    ].filter(Boolean);

    const text = lines.join("\n");
    const endpoint = `https://api.telegram.org/bot${token.trim()}/sendMessage`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Telegram] Falló el envío del mensaje (HTTP " + res.status + "):", errText);
    } else {
      console.log("[Telegram] ¡Notificación de lead enviada exitosamente!");
    }
  } catch (err) {
    console.error("[Telegram] Error crítico al despachar notificación de lead:", err);
  }
}
