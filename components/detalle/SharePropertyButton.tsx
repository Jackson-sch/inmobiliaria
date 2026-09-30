"use client";

import { useState } from "react";
import { Share2, Check, MessageCircle, Copy } from "lucide-react";
import { toast } from "sonner";

interface SharePropertyButtonProps {
  title: string;
  price: string;
  district: string;
}

export function SharePropertyButton({
  title,
  price,
  district,
}: SharePropertyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Mira esta propiedad: ${title} (${price}) en ${district}`;

    // Si el navegador soporta Web Share API (celulares modernos iOS / Android)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return;
      } catch (err) {
        // El usuario canceló o falló, abrimos el menú alternativo
        if ((err as Error).name === "AbortError") return;
      }
    }

    // Si es desktop o no soporta navigator.share, alternamos el menú
    setShowMenu((prev) => !prev);
  };

  const handleCopy = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 2500);
    } catch {
      // Fallback
    }
  };

  const handleWhatsApp = () => {
    if (typeof window === "undefined") return;
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isLocal) {
      toast.info(
        "Aviso: Al compartir desde localhost, WhatsApp no puede mostrar la portada en tu celular hasta que esté publicado en tu dominio o Vercel."
      );
    }
    const url = window.location.href;
    const text = `Hola, mira esta propiedad en ${district}: *${title}* (${price})\n\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-xl border border-stone bg-white px-3.5 py-2 text-xs font-medium text-ink shadow-xs transition-colors hover:border-sage-deep hover:bg-linen hover:text-sage-deep"
        title="Compartir propiedad"
        aria-label="Compartir propiedad"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-700">¡Copiado!</span>
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4 text-neutral-500" />
            <span>Compartir</span>
          </>
        )}
      </button>

      {/* Menú flotante para computadoras de escritorio */}
      {showMenu && (
        <div className="absolute right-0 top-full z-30 mt-2 w-52 rounded-xl border border-stone bg-white p-2 shadow-xl animate-in fade-in zoom-in-95">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-ink hover:bg-linen text-left font-medium transition-colors"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            Compartir en WhatsApp
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-ink hover:bg-linen text-left font-medium transition-colors"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="h-4 w-4 text-neutral-500" />
            )}
            {copied ? "¡Enlace copiado!" : "Copiar enlace web"}
          </button>
        </div>
      )}
    </div>
  );
}
