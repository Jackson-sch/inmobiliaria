"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

interface FloatingWhatsAppProps {
  phone?: string;
  agentName?: string;
}

export function FloatingWhatsApp({
  phone = "51900000000",
  agentName = "Jean",
}: FloatingWhatsAppProps) {
  const [closed, setClosed] = useState(false);

  const cleanPhone = phone.replace(/\D/g, "") || "51900000000";
  const message = encodeURIComponent(
    `Hola ${agentName}, te escribo desde tu sitio web y me gustaría recibir asesoría inmobiliaria.`
  );
  const waUrl = `https://wa.me/${cleanPhone}?text=${message}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 print:hidden">
      {!closed && (
        <div className="relative hidden sm:flex items-center gap-2 rounded-2xl border border-stone bg-white px-3.5 py-2 text-xs font-medium text-ink shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <span>¿Buscas comprar o vender en Trujillo?</span>
          <button
            type="button"
            onClick={() => setClosed(true)}
            className="text-neutral-400 hover:text-neutral-600 ml-1"
            title="Cerrar aviso"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar a Jean Mendocilla por WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl transition-all duration-300 hover:scale-110 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500"></span>
        </span>
        <MessageCircle className="h-7 w-7 transition-transform group-hover:rotate-6" />
      </a>
    </div>
  );
}
