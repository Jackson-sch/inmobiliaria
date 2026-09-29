"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, Save, Cloud, Key, ShieldCheck } from "lucide-react";
import { saveCloudinarySettings, testCloudinaryConnection, type CloudinaryConfig } from "@/actions/settings";

export function CloudinarySettingsForm({
  initialConfig,
}: {
  initialConfig: CloudinaryConfig;
}) {
  const [cloudName, setCloudName] = useState(initialConfig.cloudName);
  const [apiKey, setApiKey] = useState(initialConfig.apiKey);
  const [apiSecret, setApiSecret] = useState(initialConfig.apiSecret);

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    const res = await saveCloudinarySettings({
      cloudName,
      apiKey,
      apiSecret,
    });

    setIsSaving(false);
    if (res.success) {
      setStatusMessage({ type: "success", text: "¡Credenciales de Cloudinary guardadas exitosamente en la base de datos!" });
    } else {
      setStatusMessage({ type: "error", text: res.error || "Error al guardar configuración." });
    }
  }

  async function handleTest() {
    setIsTesting(true);
    setStatusMessage(null);

    const res = await testCloudinaryConnection({
      cloudName,
      apiKey,
      apiSecret,
    });

    setIsTesting(false);
    if (res.success) {
      setStatusMessage({ type: "success", text: res.message || "Conexión exitosa con Cloudinary." });
    } else {
      setStatusMessage({ type: "error", text: res.error || "No se pudo conectar a Cloudinary." });
    }
  }

  const isConfigured = Boolean(cloudName && apiKey && apiSecret);

  return (
    <div className="space-y-6">
      {/* Estado actual */}
      <div className="flex items-center justify-between rounded-xl border border-stone bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isConfigured ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            <Cloud className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-ink">Estado del Almacenamiento de Fotos</h3>
            <p className="text-xs text-ink-soft">
              {isConfigured
                ? "Cloudinary está configurado en la base de datos."
                : "Aún no has configurado tus credenciales de Cloudinary."}
            </p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isConfigured ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {isConfigured ? "Configurado" : "Pendiente"}
        </span>
      </div>

      {statusMessage && (
        <div
          className={`flex items-start gap-2 rounded-xl border p-4 text-sm ${
            statusMessage.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-red-300 bg-red-50 text-red-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          )}
          <div className="flex-1 text-xs leading-relaxed">{statusMessage.text}</div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-stone bg-white p-6 sm:p-8 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink">
            Cloud Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Cloud className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              required
              value={cloudName}
              onChange={(e) => setCloudName(e.target.value)}
              placeholder="ej: demo-realestate"
              className="w-full rounded-md border border-neutral-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-sage-deep focus:ring-2 focus:ring-sage/20"
            />
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            Es el nombre único de tu nube en Cloudinary (visible en tu Dashboard).
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink">
            API Key <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Key className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              required
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="ej: 123456789012345"
              className="w-full rounded-md border border-neutral-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-sage-deep focus:ring-2 focus:ring-sage/20"
            />
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            Clave de API numérica provista en el panel de Cloudinary.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink">
            API Secret <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="password"
              required
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="••••••••••••••••••••••••"
              className="w-full rounded-md border border-neutral-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-sage-deep focus:ring-2 focus:ring-sage/20"
            />
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            Se almacena cifrado en Supabase con RLS protegido para administradores.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end border-t border-stone">
          <button
            type="button"
            disabled={isTesting || !cloudName || !apiKey || !apiSecret}
            onClick={handleTest}
            className="flex items-center justify-center gap-2 rounded-md border border-stone px-4 py-2 text-sm font-medium text-ink hover:bg-linen disabled:opacity-50 transition-colors"
          >
            {isTesting && <Loader2 className="h-4 w-4 animate-spin" />}
            Probar Conexión
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 rounded-md bg-ink px-6 py-2 text-sm font-medium text-linen hover:bg-sage-deep disabled:opacity-50 transition-colors"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar en Base de Datos
          </button>
        </div>
      </form>

      {/* Guía rápida */}
      <div className="rounded-xl border border-stone/80 bg-white/70 p-5 text-xs text-ink-soft space-y-2">
        <h4 className="font-semibold text-ink">¿Dónde encontrar estos datos en Cloudinary?</h4>
        <ol className="list-decimal list-inside space-y-1 pl-1">
          <li>Inicia sesión en <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="text-sage-deep underline font-medium">cloudinary.com</a>.</li>
          <li>En la pantalla principal (**Dashboard** o **Programmable Media**), localiza la tarjeta **"Product Environment Credentials"**.</li>
          <li>Copia tu **Cloud Name**, **API Key** y haz clic en el icono de ojo para copiar el **API Secret**.</li>
          <li>Pégalos aquí y haz clic en **"Probar Conexión"** y luego en **"Guardar"**.</li>
        </ol>
      </div>
    </div>
  );
}
