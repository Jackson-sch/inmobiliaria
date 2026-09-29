import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HeroSearchBar } from "@/components/catalogo/HeroSearchBar";

interface HomeHeroSectionProps {
  mvcsNumber?: string;
  districts: string[];
}

export function HomeHeroSection({ mvcsNumber, districts }: HomeHeroSectionProps) {
  return (
    <>
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 pb-16 pt-14 md:grid-cols-12 md:pb-24 md:pt-20">
        <div className="flex flex-col justify-center md:col-span-5">
          <p className="text-xs uppercase tracking-[0.2em] text-sage-deep font-semibold">
            Trujillo · Perú
          </p>
          <h1 className="mt-4 font-display text-4xl leading-[1.08] tracking-tightish text-ink sm:text-5xl">
            Un hogar no se
            <br />
            <span className="italic">busca</span>, se encuentra
            <br />
            con quien conoce el camino.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
            Acompaño a familias e inversionistas en la compra y venta de casas,
            departamentos y terrenos en Trujillo — con asesoría cercana, de principio a fin.
          </p>

          <div className="mt-8 flex items-center gap-6">
            <Link
              href="/propiedades"
              className="rounded-full bg-ink px-6 py-3 text-sm text-linen transition-colors hover:bg-sage-deep shadow-xs"
            >
              Ver propiedades disponibles
            </Link>
            <Link
              href="/#contacto"
              className="flex items-center gap-1 text-sm text-ink-soft hover:text-ink font-medium"
            >
              Conversemos
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-stone pt-6">
            <div>
              <dt className="font-display text-2xl text-ink">+120</dt>
              <dd className="mt-1 text-xs text-ink-soft">Propiedades gestionadas</dd>
            </div>
            <div>
              <dt className="font-display text-2xl text-ink">8</dt>
              <dd className="mt-1 text-xs text-ink-soft">Años de trayectoria</dd>
            </div>
            <div>
              <dt className="font-display text-xl text-sage-deep font-semibold">
                {mvcsNumber || "PN-14285"}
              </dt>
              <dd className="mt-1 text-xs text-ink-soft">Registro Oficial MVCS</dd>
            </div>
          </dl>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-md md:col-span-7 bg-stone shadow-sm">
          <Image
            src="/hero-property.jpg"
            alt="Fachada de una casa moderna en Trujillo"
            fill
            priority
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* Buscador Rápido Hero */}
      <div className="mx-auto -mt-6 mb-16 max-w-5xl px-6 sm:-mt-10 relative z-10">
        <HeroSearchBar districts={districts} />
      </div>
    </>
  );
}
