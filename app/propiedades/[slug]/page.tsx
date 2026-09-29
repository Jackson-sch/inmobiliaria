import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/lib/queries/properties";
import { getContactAndSocialSettings } from "@/actions/settings";
import { PropertyGallery } from "@/components/detalle/PropertyGallery";
import { PropertySpecs } from "@/components/detalle/PropertySpecs";
import { PropertyLocationMap } from "@/components/detalle/PropertyLocationMap";
import { PropertyAgentSidebar } from "@/components/detalle/PropertyAgentSidebar";
import { PropertyPrintHeader, PropertyPrintFooter } from "@/components/detalle/PropertyPrintSheet";
import { MortgageCalculator } from "@/components/detalle/MortgageCalculator";
import { SharePropertyButton } from "@/components/detalle/SharePropertyButton";
import { PrintPropertyButton } from "@/components/detalle/PrintPropertyButton";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

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

  const agentName = property.agent?.fullName || contact.fullName || "Jean Mendocilla";
  const agentPhone = property.agent?.whatsapp || contact.whatsapp || contact.phone;
  const avatarUrl = property.agent?.avatarUrl || contact.avatarUrl || contact.aboutPhotoUrl || "/jean-mendocilla-office.jpg";

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <PropertyPrintHeader
          agentName={agentName}
          agentPhone={agentPhone}
          mvcsNumber={contact.mvcsNumber}
          propertySlug={property.slug}
        />

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

            {/* Ficha técnica de especificaciones */}
            <PropertySpecs
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              parkingSpots={property.parkingSpots}
              builtAreaM2={property.builtAreaM2}
              landAreaM2={property.landAreaM2}
              yearBuilt={property.yearBuilt}
              floors={property.floors}
            />

            {/* Descripción */}
            <div className="rounded-xl border border-stone bg-white p-6 shadow-2xs">
              <h2 className="mb-2 font-medium text-neutral-900 font-display text-lg">
                Descripción
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                {property.description}
              </p>
            </div>

            {/* Amenidades */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="rounded-xl border border-stone bg-white p-6 shadow-2xs">
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

            {/* Simulador de crédito hipotecario */}
            {property.operation === "venta" && (
              <div className="print:hidden">
                <MortgageCalculator
                  propertyPrice={Number(property.price)}
                  currency={property.currency as "PEN" | "USD"}
                  propertyTitle={property.title}
                  agentPhone={agentPhone}
                  agentName={agentName}
                />
              </div>
            )}

            {/* Mapa de ubicación */}
            {mapEmbedSrc && (
              <PropertyLocationMap
                mapEmbedSrc={mapEmbedSrc}
                title={property.title}
                address={property.address}
                district={property.district}
                city={property.city}
              />
            )}
          </div>

          {/* Columna lateral del Asesor */}
          <PropertyAgentSidebar
            agentName={agentName}
            agentPhone={agentPhone}
            avatarUrl={avatarUrl}
            mvcsNumber={contact.mvcsNumber}
            propertyTitle={property.title}
            propertyId={property.id}
          />
        </div>

        <PropertyPrintFooter
          agentName={agentName}
          agentPhone={agentPhone}
        />
      </div>
      <SiteFooter />
    </>
  );
}
