import { Star, Quote } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  district: string;
  quote: string;
  stars: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Familia Alva Rodríguez",
    role: "Compradores de Casa",
    district: "Urb. El Golf · Víctor Larco",
    quote:
      "Jean nos acompañó con paciencia en cada paso: desde la revisión de documentos en Registros Públicos hasta la firma en notaría. Nos dio total tranquilidad y seguridad en una de las decisiones más importantes de nuestras vidas.",
    stars: 5,
  },
  {
    name: "Ing. Carlos Mendoza",
    role: "Inversionista Inmobiliario",
    district: "Urb. California · Trujillo",
    quote:
      "Excelente conocimiento del mercado y de las zonas con mayor plusvalía de Trujillo. Su honestidad al evaluar los precios reales del metro cuadrado me ahorró tiempo y dinero. Un profesional de primer nivel.",
    stars: 5,
  },
  {
    name: "Dra. Patricia Benites",
    role: "Alquiler Residencial",
    district: "Huanchaco · Trujillo",
    quote:
      "Transparente, puntual y con un trato muy humano. Encontramos la propiedad ideal frente al mar en tiempo récord y con un contrato impecable. Recomiendo totalmente su asesoría a cualquiera que busque en Trujillo.",
    stars: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="border-t border-stone bg-linen-deep/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-sage-deep font-medium">
            Historias Reales
          </p>
          <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
            La confianza de quienes ya encontraron su hogar
          </h2>
          <p className="mt-4 text-sm text-ink-soft leading-relaxed">
            Acompañamiento honesto y cercano en cada operación inmobiliaria en Trujillo.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((item, index) => (
            <div
              key={index}
              className="relative flex flex-col justify-between rounded-2xl border border-stone bg-white p-7 shadow-xs hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {Array.from({ length: item.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <Quote className="h-8 w-8 text-stone-deep/40 mb-2" />

                <p className="text-sm text-ink-soft leading-relaxed italic">
                  "{item.quote}"
                </p>
              </div>

              <div className="mt-8 border-t border-stone/60 pt-4">
                <p className="font-display font-semibold text-ink text-base">
                  {item.name}
                </p>
                <p className="text-xs text-sage-deep font-medium mt-0.5">
                  {item.role}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {item.district}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
