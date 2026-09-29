import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Phone, MessageCircle } from "lucide-react";
import { getProperties, getAvailableDistricts } from "@/lib/queries/properties";
import { getContactAndSocialSettings } from "@/actions/settings";
import { PropertyCard } from "@/components/catalogo/PropertyCard";
import { HeroSearchBar } from "@/components/catalogo/HeroSearchBar";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { HomeContactForm } from "@/components/home/HomeContactForm";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default async function HomePage() {
  const [propertiesResult, districts, contact] = await Promise.all([
    getProperties({
      featured: true,
      pageSize: 6,
    }).catch(() => ({ properties: [] })),
    getAvailableDistricts().catch(() => []),
    getContactAndSocialSettings().catch(() => ({
      fullName: "Jean Mendocilla",
      phone: "+51 900 000 000",
      whatsapp: "+51 900 000 000",
      email: "contacto@jeanmendocilla.pe",
      mvcsNumber: "PN-14285",
      facebookUrl: "",
      instagramUrl: "",
      tiktokUrl: "",
      linkedinUrl: "",
      youtubeUrl: "",
    })),
  ]);

  const featured = propertiesResult.properties;
  const cleanPhone = contact.whatsapp.replace(/\D/g, "") || "51900000000";

  return (
    <>
      <SiteHeader />
      <main>
        {/* ---------------------------------------------------------------- */}
        {/* Hero editorial asimétrico                                        */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 pb-16 pt-14 md:grid-cols-12 md:pb-24 md:pt-20">
          <div className="flex flex-col justify-center md:col-span-5">
            <p className="text-xs uppercase tracking-[0.2em] text-sage-deep">
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
              Acompaño a familias e inversionistas en la compra y venta de
              casas, departamentos y terrenos en Trujillo — con asesoría
              cercana, de principio a fin.
            </p>

            <div className="mt-8 flex items-center gap-6">
              <Link
                href="/propiedades"
                className="rounded-full bg-ink px-6 py-3 text-sm text-linen transition-colors hover:bg-sage-deep"
              >
                Ver propiedades disponibles
              </Link>
              <Link
                href="/#contacto"
                className="flex items-center gap-1 text-sm text-ink-soft hover:text-ink"
              >
                Conversemos
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-stone pt-6">
              <div>
                <dt className="font-display text-2xl text-ink">+120</dt>
                <dd className="mt-1 text-xs text-ink-soft">
                  Propiedades gestionadas
                </dd>
              </div>
              <div>
                <dt className="font-display text-2xl text-ink">8</dt>
                <dd className="mt-1 text-xs text-ink-soft">Años de trayectoria</dd>
              </div>
              <div>
                <dt className="font-display text-xl text-sage-deep font-semibold">{contact.mvcsNumber || "PN-14285"}</dt>
                <dd className="mt-1 text-xs text-ink-soft">Registro Oficial MVCS</dd>
              </div>
            </dl>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-md md:col-span-7 bg-stone">
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

        {/* ---------------------------------------------------------------- */}
        {/* Buscador Rápido Hero                                             */}
        {/* ---------------------------------------------------------------- */}
        <div className="mx-auto -mt-6 mb-16 max-w-5xl px-6 sm:-mt-10 relative z-10">
          <HeroSearchBar districts={districts} />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Propiedades destacadas                                           */}
        {/* ---------------------------------------------------------------- */}
        {featured.length > 0 && (
          <section className="border-t border-stone bg-linen-deep">
            <div className="mx-auto max-w-6xl px-6 py-16">
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-sage-deep">
                    Selección actual
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-ink">
                    Propiedades destacadas
                  </h2>
                </div>
                <Link
                  href="/propiedades"
                  className="hidden items-center gap-1 text-sm text-ink-soft hover:text-ink sm:flex"
                >
                  Ver todas
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Sobre el agente                                                   */}
        {/* ---------------------------------------------------------------- */}
        <section id="nosotros" className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:items-center">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl md:col-span-5 bg-stone shadow-md">
              <Image
                src="/jean-mendocilla-exterior.jpg"
                alt={`${contact.fullName}, asesor inmobiliario`}
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
                {contact.mvcsNumber && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
                    Registro MVCS: {contact.mvcsNumber}
                  </span>
                )}
              </div>
              <h2 className="mt-2 font-display text-3xl text-ink">
                {contact.fullName}
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft">
                Trabajo día a día en el mercado inmobiliario de Trujillo,
                acompañando a cada cliente en una de las decisiones patrimoniales más importantes de su vida. Como agente inmobiliario acreditado ante el Ministerio de Vivienda, Construcción y Saneamiento (MVCS), creo en la asesoría transparente, la rigurosidad legal y el seguimiento cercano — desde la primera visita hasta la firma en notaría.
              </p>
              <Link
                href="/#contacto"
                className="mt-8 inline-flex items-center gap-1 border-b border-ink pb-0.5 text-sm text-ink hover:border-sage-deep hover:text-sage-deep"
              >
                Escríbeme directamente
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Testimonios de clientes                                          */}
        {/* ---------------------------------------------------------------- */}
        <TestimonialsSection />

        {/* ---------------------------------------------------------------- */}
        {/* CTA final con alto contraste y formulario rápido                 */}
        {/* ---------------------------------------------------------------- */}
        <section id="contacto" className="relative overflow-hidden border-t border-neutral-900 bg-neutral-950 text-white">
          {/* Fondo panorámico con overlay de alto contraste */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <Image
              src="/jean-mendocilla-banner.jpg"
              alt={`${contact.fullName} Asesoría Inmobiliaria`}
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
                  {contact.mvcsNumber && (
                    <div className="flex items-center gap-3 text-sm text-neutral-200">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-400">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Acreditación Oficial</p>
                        <p className="text-xs text-neutral-400">Registro MVCS: {contact.mvcsNumber} · Ministerio de Vivienda</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm text-neutral-200">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-400">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Contacto Directo</p>
                      <p className="text-xs text-neutral-400">{contact.phone} · {contact.email}</p>
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
                    Conversar directamente por WhatsApp ({contact.whatsapp})
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
      </main>
      <SiteFooter />
    </>
  );
}
