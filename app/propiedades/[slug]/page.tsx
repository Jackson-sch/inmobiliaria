import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { BedDouble, Bath, Car, Ruler, Calendar, Building2, MapPin, ExternalLink, ShieldCheck } from "lucide-react";
import { getPropertyBySlug } from "@/lib/queries/properties";
import { PropertyGallery } from "@/components/detalle/PropertyGallery";
import { MortgageCalculator } from "@/components/detalle/MortgageCalculator";
import { SharePropertyButton } from "@/components/detalle/SharePropertyButton";
import { PrintPropertyButton } from "@/components/detalle/PrintPropertyButton";
import { WhatsAppButton } from "@/components/detalle/WhatsAppButton";
import { ContactForm } from "@/components/detalle/ContactForm";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getContactAndSocialSettings } from "@/actions/settings";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatPrice(price: number, currency: string): string {
  const symbol = currency === "USD" ? "$" : "S/";
  return `${symbol} ${price.toLocaleString("es-PE")}`;
}

const TYPE_LABELS: Record<string, string> = {
  casa: "Casa",
  departamento: "Departamento",
  terreno: "Terreno",
  oficina: "Oficina",
  local_comercial: "Local comercial",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug).catch(() => null);
  if (!property) return {};

  const cover =
    property.images?.find((img) => img.isCover) ?? property.images?.[0];
  const symbol = property.currency === "USD" ? "$" : "S/";
  const formattedPrice = `${symbol} ${property.price.toLocaleString("es-PE")}`;
  const typeLabel = TYPE_LABELS[property.type] ?? property.type;
  const opLabel = property.operation === "venta" ? "en venta" : "en alquiler";

  const title = `${property.title} | ${formattedPrice}`;
  const description = property.description
    ? property.description.slice(0, 155)
    : `${typeLabel} ${opLabel} en ${property.district}, ${property.city}. ${formattedPrice}. Asesoría Jean Mendocilla.`;

  const imageUrl = cover?.secureUrl || "/hero-property.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [property, contact] = await Promise.all([
    getPropertyBySlug(slug).catch(() => null),
    getContactAndSocialSettings(),
  ]);

  if (!property) {
    notFound();
  }

  const mapSearchQuery = encodeURIComponent(
    `${property.address ? `${property.address}, ` : ""}${property.district}, ${property.city}, Perú`
  );
  const mapEmbedSrc =
    property.latitude && property.longitude
      ? `https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`
      : `https://www.google.com/maps?q=${mapSearchQuery}&z=14&output=embed`;

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Cabecera exclusiva para Ficha Técnica Impresa / PDF */}
        <div className="hidden print:block mb-8 border-b-2 border-stone-deep pb-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-sage-deep">
                Ficha Técnica Inmobiliaria {contact.mvcsNumber ? `· Registro MVCS ${contact.mvcsNumber}` : ""}
              </span>
              <h2 className="font-display text-2xl font-bold text-ink mt-0.5 uppercase">
                {contact.fullName || "Jean Mendocilla"}
              </h2>
              <p className="text-xs text-ink-soft">
                Asesoría Inmobiliaria Profesional · Trujillo, La Libertad
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                WhatsApp / Celular: {contact.whatsapp || contact.phone} · Web: jeanmendocilla.pe
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded-md border border-stone bg-linen px-3 py-1 text-xs font-semibold text-ink">
                Ref: {property.slug}
              </span>
              <p className="text-[10px] text-neutral-400 mt-1">
                Documento Oficial
              </p>
            </div>
          </div>
        </div>

        <PropertyGallery images={property.images ?? []} title={property.title} />

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <span className="text-sm font-medium text-sage-deep uppercase tracking-wider">
                  {TYPE_LABELS[property.type] ?? property.type} en{" "}
                  {property.operation === "venta" ? "venta" : "alquiler"}
                </span>
                <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-neutral-900 font-display">
                  {property.title}
                </h1>
                <p className="mt-1 text-neutral-500">
                  {property.address ? `${property.address}, ` : ""}
                  {property.district}, {property.city}
                </p>
                <p className="mt-3 text-3xl font-bold text-neutral-900 font-display">
                  {formatPrice(property.price, property.currency)}
                </p>
              </div>

              {/* Botones de acción: Compartir & Ficha PDF */}
              <div className="flex items-center gap-2 print:hidden self-start sm:self-center">
                <SharePropertyButton
                  title={property.title}
                  price={formatPrice(property.price, property.currency)}
                  district={property.district}
                />
                <PrintPropertyButton />
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-4 rounded-xl border border-stone bg-white p-5 sm:grid-cols-4">
              {property.bedrooms != null && (
                <div className="flex flex-col items-center gap-1 text-center">
                  <BedDouble className="h-5 w-5 text-neutral-400" />
                  <dd className="text-sm font-medium">{property.bedrooms}</dd>
                  <dt className="text-xs text-neutral-500">Dormitorios</dt>
                </div>
              )}
              {property.bathrooms != null && (
                <div className="flex flex-col items-center gap-1 text-center">
                  <Bath className="h-5 w-5 text-neutral-400" />
                  <dd className="text-sm font-medium">{property.bathrooms}</dd>
                  <dt className="text-xs text-neutral-500">Baños</dt>
                </div>
              )}
              {property.parkingSpots > 0 && (
                <div className="flex flex-col items-center gap-1 text-center">
                  <Car className="h-5 w-5 text-neutral-400" />
                  <dd className="text-sm font-medium">{property.parkingSpots}</dd>
                  <dt className="text-xs text-neutral-500">Cocheras</dt>
                </div>
              )}
              {(property.builtAreaM2 ?? property.landAreaM2) != null && (
                <div className="flex flex-col items-center gap-1 text-center">
                  <Ruler className="h-5 w-5 text-neutral-400" />
                  <dd className="text-sm font-medium">
                    {property.builtAreaM2 ?? property.landAreaM2} m²
                  </dd>
                  <dt className="text-xs text-neutral-500">
                    {property.builtAreaM2 ? "Construidos" : "Terreno"}
                  </dt>
                </div>
              )}
              {property.yearBuilt != null && (
                <div className="flex flex-col items-center gap-1 text-center">
                  <Calendar className="h-5 w-5 text-neutral-400" />
                  <dd className="text-sm font-medium">{property.yearBuilt}</dd>
                  <dt className="text-xs text-neutral-500">Año</dt>
                </div>
              )}
              {property.floors != null && (
                <div className="flex flex-col items-center gap-1 text-center">
                  <Building2 className="h-5 w-5 text-neutral-400" />
                  <dd className="text-sm font-medium">{property.floors}</dd>
                  <dt className="text-xs text-neutral-500">Pisos</dt>
                </div>
              )}
            </dl>

            <div className="rounded-xl border border-stone bg-white p-6">
              <h2 className="mb-2 font-medium text-neutral-900 font-display text-lg">
                Descripción
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                {property.description}
              </p>
            </div>

            {property.amenities && property.amenities.length > 0 && (
              <div className="rounded-xl border border-stone bg-white p-6">
                <h2 className="mb-3 font-medium text-neutral-900 font-display text-lg">
                  Amenidades
                </h2>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {property.amenities.map((amenity) => (
                    <li
                      key={amenity.id}
                      className="rounded-md bg-linen px-3 py-2 text-sm text-neutral-700 border border-stone/50"
                    >
                      {amenity.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {property.operation === "venta" && (
              <div className="print:hidden">
                <MortgageCalculator
                  propertyPrice={Number(property.price)}
                  currency={property.currency as "PEN" | "USD"}
                  propertyTitle={property.title}
                  agentPhone={property.agent?.whatsapp || contact.whatsapp}
                  agentName={property.agent?.fullName || contact.fullName || "Jean Mendocilla"}
                />
              </div>
            )}

            {mapEmbedSrc && (
              <div className="rounded-xl border border-stone bg-white p-6 print:break-inside-avoid">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-medium text-neutral-900 font-display text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-sage-deep" />
                    Ubicación y Entorno
                  </h2>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${property.address ? `${property.address}, ` : ""}${property.district}, ${property.city}, Perú`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-sage-deep hover:underline"
                  >
                    Ver en Google Maps
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <iframe
                  src={mapEmbedSrc}
                  className="h-72 w-full rounded-xl border border-stone"
                  loading="lazy"
                  title={`Ubicación de ${property.title}`}
                />
                <p className="mt-2 text-xs text-neutral-400">
                  Ubicación referencial: {property.address ? `${property.address}, ` : ""}{property.district}, {property.city}.
                </p>
              </div>
            )}
          </div>

          {/* Columna lateral: contacto */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start print:hidden">
            {/* Tarjeta del Asesor */}
            <div className="rounded-xl border border-stone bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-sage/40 bg-stone flex-shrink-0 shadow-inner">
                  <Image
                    src="/jean-mendocilla-office.jpg"
                    alt={property.agent?.fullName || contact.fullName || "Jean Mendocilla"}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-ink text-base">
                    {property.agent?.fullName || contact.fullName || "Jean Mendocilla"}
                  </h3>
                  <p className="text-xs text-sage-deep font-medium">
                    Asesor Inmobiliario · Trujillo
                  </p>
                  {contact.mvcsNumber && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Registro MVCS: {contact.mvcsNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(property.agent?.whatsapp || contact.whatsapp) && (
              <WhatsAppButton
                phone={property.agent?.whatsapp || contact.whatsapp}
                propertyTitle={property.title}
              />
            )}
            <ContactForm propertyId={property.id} />
          </aside>
        </div>

        {/* Pie de página exclusivo para Ficha Impresa / PDF */}
        <div className="hidden print:block mt-12 border-t-2 border-stone-deep pt-4">
          <div className="flex items-center justify-between text-xs text-neutral-600">
            <div>
              <p className="font-semibold text-ink">{contact.fullName || "Jean Mendocilla"} — Asesoría Inmobiliaria</p>
              <p className="mt-0.5">Para coordinar una visita o consultas sobre esta propiedad, contáctame directamente.</p>
              <p className="mt-0.5 font-medium text-sage-deep">Tel / WhatsApp: {contact.whatsapp || contact.phone}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[11px] text-ink">jeanmendocilla.pe</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Ficha informativa generada para clientes.</p>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
