import Image from "next/image";
import { ShieldCheck, Phone, MessageCircle } from "lucide-react";
import { HomeContactForm } from "@/components/home/HomeContactForm";

interface HomeCtaSectionProps {
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
  mvcsNumber?: string;
}

export function HomeCtaSection({
  fullName,
  phone,
  whatsapp,
  email,
  mvcsNumber,
}: HomeCtaSectionProps) {
  const cleanPhone = whatsapp.replace(/\D/g, "") || "51900000000";

  return (
    <section id="contacto" className="relative overflow-hidden border-t border-neutral-900 bg-neutral-950 text-white">
      {/* Fondo panorámico con overlay de alto contraste */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <Image
          src="/jean-mendocilla-banner.jpg"
          alt={`${fullName} Asesoría Inmobiliaria`}
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950/95 to-neutral-900/90 pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Columna Izquierda: Información de contacto y credibilidad */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sage/40 bg-sage/20 px-3.5 py-1 text-xs font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                Atención personalizada en Trujillo y balnearios
              </span>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                ¿Buscas comprar, vender o alquilar en Trujillo?
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-300 max-w-lg">
                Cuéntame qué necesitas y te ayudo a encontrar la mejor opción sin presión,
                con precios reales del mercado y total respaldo legal documentado.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {mvcsNumber && (
                <div className="flex items-center gap-3 text-sm text-neutral-200">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Acreditación Oficial</p>
                    <p className="text-xs text-neutral-400">Registro MVCS: {mvcsNumber} · Ministerio de Vivienda</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm text-neutral-200">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-400">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">Contacto Directo</p>
                  <p className="text-xs text-neutral-400">{phone} · {email}</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-semibold text-white shadow-xl transition-all hover:bg-emerald-700 hover:scale-[1.02]"
              >
                <MessageCircle className="h-4 w-4" />
                Conversar directamente por WhatsApp ({whatsapp})
              </a>
            </div>
          </div>

          {/* Columna Derecha: Formulario Rápido de Captación */}
          <div className="lg:col-span-6">
            <HomeContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
