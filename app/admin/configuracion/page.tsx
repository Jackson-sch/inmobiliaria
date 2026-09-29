import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CloudinarySettingsForm } from "@/components/admin/CloudinarySettingsForm";
import { TelegramSettingsForm } from "@/components/admin/TelegramSettingsForm";
import { ContactSettingsForm } from "@/components/admin/ContactSettingsForm";
import {
  getCloudinarySettings,
  getTelegramSettings,
  getContactAndSocialSettings,
} from "@/actions/settings";

export const metadata = {
  title: "Configuración del Sistema | Panel Inmobiliario",
};

export default async function ConfiguracionPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [contactConfig, cloudinaryConfig, telegramConfig] = await Promise.all([
    getContactAndSocialSettings(),
    getCloudinarySettings(),
    getTelegramSettings(),
  ]);

  return (
    <div className="min-h-screen bg-linen-deep/40">
      <AdminHeader userEmail={user.email} />

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Configuración del Sitio Web
          </h1>
          <p className="text-xs text-ink-soft">
            Administra los canales de atención, WhatsApp, redes sociales, credenciales de Cloudinary y alertas instantáneas de clientes.
          </p>
        </div>

        {/* Datos de Contacto y Redes del Asesor */}
        <ContactSettingsForm initialConfig={contactConfig} />

        {/* Almacenamiento de Fotos Cloudinary */}
        <CloudinarySettingsForm initialConfig={cloudinaryConfig} />

        {/* Notificaciones de Leads Telegram */}
        <TelegramSettingsForm initialConfig={telegramConfig} />
      </main>
    </div>
  );
}
