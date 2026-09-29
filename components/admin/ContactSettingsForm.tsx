"use client";

import { useState } from "react";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
  Phone,
  MessageCircle,
  Mail,
  ShieldCheck,
  Share2,
} from "lucide-react";
import {
  saveContactAndSocialSettings,
  type ContactAndSocialConfig,
} from "@/actions/settings";
import { ProfilePhotoUploader } from "@/components/admin/ProfilePhotoUploader";

export function ContactSettingsForm({
  initialConfig,
}: {
  initialConfig: ContactAndSocialConfig;
}) {
  const [config, setConfig] = useState<ContactAndSocialConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    const res = await saveContactAndSocialSettings(config);
    if (res.success) {
      setStatusMessage({
        type: "success",
        text: "Datos del asesor, fotografía y redes sociales guardados exitosamente. Ya están visibles en toda la web.",
      });
    } else {
      setStatusMessage({
        type: "error",
        text: res.error || "Error al guardar los datos de contacto.",
      });
    }
    setIsSaving(false);
  };

  return (
    <div className="rounded-xl border border-stone bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 border-b border-stone/60 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <UserCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">
            Identidad, Fotografía y Canales del Asesor
          </h2>
          <p className="text-xs text-neutral-500">
            Personaliza la foto de la sección &ldquo;Sobre mí&rdquo;, nombre, WhatsApp, registro MVCS y redes sociales.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-6 space-y-8">
        {/* Bloque: Fotografía en Cloudinary */}
        <ProfilePhotoUploader
          photoUrl={config.aboutPhotoUrl}
          agentName={config.fullName}
          disabled={isSaving}
          onPhotoChange={(newUrl) =>
            setConfig((prev) => ({
              ...prev,
              aboutPhotoUrl: newUrl,
              avatarUrl: newUrl,
            }))
          }
        />

        {/* Bloque 1: Datos de Contacto Directo */}
        <div className="pt-2 border-t border-stone/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sage-deep mb-3 flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            Canales de Atención Directa
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Nombre del Asesor / Marca
              </label>
              <input
                type="text"
                value={config.fullName}
                onChange={(e) => setConfig({ ...config, fullName: e.target.value })}
                placeholder="Ej: Jean Mendocilla"
                required
                className="w-full rounded-lg border border-neutral-200 bg-linen/30 px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-sage-deep focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Registro Oficial MVCS (Ministerio de Vivienda)
              </label>
              <div className="relative">
                <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                <input
                  type="text"
                  value={config.mvcsNumber}
                  onChange={(e) => setConfig({ ...config, mvcsNumber: e.target.value })}
                  placeholder="Ej: PN-14285"
                  className="w-full rounded-lg border border-neutral-200 bg-linen/30 py-2.5 pl-9 pr-3 text-xs text-ink outline-none transition focus:border-sage-deep focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Número de WhatsApp (con código de país)
              </label>
              <div className="relative">
                <MessageCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                <input
                  type="text"
                  value={config.whatsapp}
                  onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                  placeholder="Ej: +51 900 000 000"
                  required
                  className="w-full rounded-lg border border-neutral-200 bg-linen/30 py-2.5 pl-9 pr-3 text-xs text-ink outline-none transition focus:border-sage-deep focus:bg-white"
                />
              </div>
              <p className="mt-1 text-[11px] text-neutral-400">
                Se usará en el botón flotante, fichas de propiedades y cotizador hipotecario.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Teléfono de Llamadas
              </label>
              <input
                type="text"
                value={config.phone}
                onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                placeholder="Ej: +51 900 000 000"
                required
                className="w-full rounded-lg border border-neutral-200 bg-linen/30 px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-sage-deep focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-ink mb-1">
                Correo Electrónico de Contacto
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  placeholder="contacto@jeanmendocilla.pe"
                  required
                  className="w-full rounded-lg border border-neutral-200 bg-linen/30 py-2.5 pl-9 pr-3 text-xs text-ink outline-none transition focus:border-sage-deep focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bloque 2: Redes Sociales */}
        <div className="pt-4 border-t border-stone/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sage-deep mb-3 flex items-center gap-1.5">
            <Share2 className="h-3.5 w-3.5" />
            Redes Sociales Oficiales
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Página o Perfil de Facebook
              </label>
              <input
                type="url"
                value={config.facebookUrl}
                onChange={(e) => setConfig({ ...config, facebookUrl: e.target.value })}
                placeholder="https://www.facebook.com/tu-pagina"
                className="w-full rounded-lg border border-neutral-200 bg-linen/30 px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-sage-deep focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Perfil de Instagram
              </label>
              <input
                type="url"
                value={config.instagramUrl}
                onChange={(e) => setConfig({ ...config, instagramUrl: e.target.value })}
                placeholder="https://www.instagram.com/tu-usuario"
                className="w-full rounded-lg border border-neutral-200 bg-linen/30 px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-sage-deep focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Cuenta de TikTok
              </label>
              <input
                type="url"
                value={config.tiktokUrl}
                onChange={(e) => setConfig({ ...config, tiktokUrl: e.target.value })}
                placeholder="https://www.tiktok.com/@tu-usuario"
                className="w-full rounded-lg border border-neutral-200 bg-linen/30 px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-sage-deep focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Perfil de LinkedIn
              </label>
              <input
                type="url"
                value={config.linkedinUrl}
                onChange={(e) => setConfig({ ...config, linkedinUrl: e.target.value })}
                placeholder="https://www.linkedin.com/in/tu-perfil"
                className="w-full rounded-lg border border-neutral-200 bg-linen/30 px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-sage-deep focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-ink mb-1">
                Canal de YouTube (opcional)
              </label>
              <input
                type="url"
                value={config.youtubeUrl}
                onChange={(e) => setConfig({ ...config, youtubeUrl: e.target.value })}
                placeholder="https://www.youtube.com/@tu-canal"
                className="w-full rounded-lg border border-neutral-200 bg-linen/30 px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-sage-deep focus:bg-white"
              />
            </div>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`flex items-center gap-2 rounded-lg p-3 text-xs ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-stone/60">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-ink px-6 py-2.5 text-xs font-medium text-linen hover:bg-sage-deep disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isSaving ? "Guardando..." : "Guardar Contacto, Foto y Redes"}
          </button>
        </div>
      </form>
    </div>
  );
}
