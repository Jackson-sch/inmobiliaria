"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2, BellRing, ShieldCheck } from "lucide-react";
import {
  saveTelegramSettings,
  testTelegramNotification,
  type TelegramConfig,
} from "@/actions/settings";

export function TelegramSettingsForm({
  initialConfig,
}: {
  initialConfig: TelegramConfig;
}) {
  const [config, setConfig] = useState<TelegramConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isConfigured = Boolean(config.botToken && config.chatId);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    const res = await saveTelegramSettings(config);
    if (res.success) {
      setStatusMessage({
        type: "success",
        text: "Configuración de Telegram guardada correctamente en la base de datos.",
      });
    } else {
      setStatusMessage({
        type: "error",
        text: res.error || "Error al guardar la configuración.",
      });
    }
    setIsSaving(false);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setStatusMessage(null);

    // Guardar automáticamente primero en la DB para que los formularios de la web ya cuenten con las credenciales
    const saveRes = await saveTelegramSettings(config);
    if (!saveRes.success) {
      setStatusMessage({
        type: "error",
        text: `No se pudo guardar la configuración antes de la prueba: ${saveRes.error}`,
      });
      setIsTesting(false);
      return;
    }

    const res = await testTelegramNotification(config);
    if (res.success) {
      setStatusMessage({
        type: "success",
        text: "¡Configuración guardada exitosamente y mensaje de prueba enviado a tu Telegram!",
      });
    } else {
      setStatusMessage({
        type: "error",
        text: res.error || "No se pudo enviar la alerta de prueba.",
      });
    }
    setIsTesting(false);
  };

  return (
    <div className="rounded-xl border border-stone bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Alertas Instantáneas de Leads (Telegram)
            </h2>
            <p className="text-xs text-neutral-500">
              Recibe una notificación en tiempo real en tu celular cada vez que un cliente llene un formulario en la web.
            </p>
          </div>
        </div>

        <div className="flex items-center">
          {isConfigured ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Notificaciones activas
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Pendiente de configurar
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink">
            Telegram Bot Token
          </label>
          <input
            type="text"
            value={config.botToken}
            onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
            placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
            className="mt-1 w-full rounded-lg border border-neutral-200 bg-linen/30 px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-sage-deep focus:bg-white font-mono"
          />
          <p className="mt-1 text-[11px] text-neutral-400">
            Obtenido conversando con @BotFather en Telegram al crear tu bot.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink">
            Telegram Chat ID
          </label>
          <input
            type="text"
            value={config.chatId}
            onChange={(e) => setConfig({ ...config, chatId: e.target.value })}
            placeholder="987654321 o -100123456789"
            className="mt-1 w-full rounded-lg border border-neutral-200 bg-linen/30 px-3.5 py-2.5 text-xs text-ink outline-none transition focus:border-sage-deep focus:bg-white font-mono"
          />
          <p className="mt-1 text-[11px] text-neutral-400">
            Tu ID personal o el ID del canal/grupo donde recibirás los avisos (puedes obtenerlo escribiendo a @userinfobot).
          </p>
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

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone/60">
          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting || !config.botToken || !config.chatId}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-stone px-4 py-2.5 text-xs font-medium text-ink hover:bg-linen disabled:opacity-50 transition-colors shadow-xs"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Guardando y probando...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5 text-sky-600" />
                Probar y Guardar Conexión
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-ink px-6 py-2.5 text-xs font-medium text-linen hover:bg-sage-deep disabled:opacity-50 transition-colors shadow-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Configuración"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
