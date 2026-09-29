import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface HomeAboutSectionProps {
  fullName: string;
  mvcsNumber?: string;
  aboutPhotoUrl?: string;
}

export function HomeAboutSection({
  fullName,
  mvcsNumber,
  aboutPhotoUrl,
}: HomeAboutSectionProps) {
  const photoSrc = aboutPhotoUrl || "/jean-mendocilla-exterior.jpg";

  return (
    <section id="nosotros" className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:items-center">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl md:col-span-5 bg-stone shadow-md">
          <Image
            src={photoSrc}
            alt={`${fullName}, asesor inmobiliario`}
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="md:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-sage-deep font-semibold">
              Sobre mí
            </p>
            {mvcsNumber && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200">
                Registro MVCS: {mvcsNumber}
              </span>
            )}
          </div>
          <h2 className="mt-2 font-display text-3xl text-ink">
            {fullName}
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft">
            Trabajo día a día en el mercado inmobiliario de Trujillo,
            acompañando a cada cliente en una de las decisiones patrimoniales más importantes de su vida. Como agente inmobiliario acreditado ante el Ministerio de Vivienda, Construcción y Saneamiento (MVCS), creo en la asesoría transparente, la rigurosidad legal y el seguimiento cercano — desde la primera visita hasta la firma en notaría.
          </p>
          <Link
            href="/#contacto"
            className="mt-8 inline-flex items-center gap-1 border-b border-ink pb-0.5 text-sm text-ink hover:border-sage-deep hover:text-sage-deep font-medium"
          >
            Escríbeme directamente
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
