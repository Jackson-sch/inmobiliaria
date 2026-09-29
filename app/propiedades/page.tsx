import Link from "next/link";
import { getAvailableDistricts, getProperties } from "@/lib/queries/properties";
import { PropertyCard } from "@/components/catalogo/PropertyCard";
import { PropertyFiltersBar } from "@/components/catalogo/PropertyFiltersBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import type { OperationType, PropertyType } from "@/types";

interface PageProps {
  searchParams: Promise<{
    type?: PropertyType;
    operation?: OperationType;
    district?: string;
    currency?: "USD" | "PEN";
    priceMin?: string;
    priceMax?: string;
    bedrooms?: string;
    bathrooms?: string;
    areaMin?: string;
    query?: string;
    page?: string;
  }>;
}

import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPropertyListSchema, buildBreadcrumbSchema } from "@/lib/seo";
import { getSiteUrl } from "@/lib/metadata";

const TYPE_NAMES: Record<string, string> = {
  casa: "Casas",
  departamento: "Departamentos",
  terreno: "Terrenos",
  oficina: "Oficinas",
  local_comercial: "Locales comerciales",
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const siteUrl = getSiteUrl();

  const typeName = params.type ? TYPE_NAMES[params.type] || params.type : "Propiedades";
  const opName = params.operation === "venta" ? "en venta" : params.operation === "alquiler" ? "en alquiler" : "en venta y alquiler";
  const locationName = params.district ? `en ${params.district}, Trujillo` : "en Trujillo";

  const title = `${typeName} ${opName} ${locationName} | Jean Mendocilla`;
  const description = `Explora ${typeName.toLowerCase()} ${opName} ${locationName}. Asesoría inmobiliaria personalizada y segura en La Libertad con Jean Mendocilla.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/propiedades`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/propiedades`,
      siteName: "Jean Mendocilla Asesoría Inmobiliaria",
      locale: "es_PE",
      type: "website",
    },
  };
}

export default async function PropiedadesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const [{ properties, total, page, totalPages }, districts] = await Promise.all([
    getProperties({
      type: params.type,
      operation: params.operation,
      district: params.district,
      currency: params.currency,
      priceMin: params.priceMin ? Number(params.priceMin) : undefined,
      priceMax: params.priceMax ? Number(params.priceMax) : undefined,
      bedrooms: params.bedrooms ? Number(params.bedrooms) : undefined,
      bathrooms: params.bathrooms ? Number(params.bathrooms) : undefined,
      areaMin: params.areaMin ? Number(params.areaMin) : undefined,
      query: params.query,
      page: params.page ? Number(params.page) : 1,
    }).catch(() => ({ properties: [], total: 0, page: 1, totalPages: 1 })),
    getAvailableDistricts().catch(() => []),
  ]);

  const siteUrl = getSiteUrl();
  const propertyListSchema = properties.length > 0 ? buildPropertyListSchema(properties, siteUrl) : null;
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Inicio", url: siteUrl },
    { name: "Propiedades", url: `${siteUrl}/propiedades` },
  ]);

  const buildPageHref = (targetPage: number) => {
    const urlParams = new URLSearchParams(
      Object.entries(params).filter(([, v]) => Boolean(v)) as [string, string][]
    );
    urlParams.set("page", String(targetPage));
    return `/propiedades?${urlParams.toString()}`;
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {propertyListSchema && <JsonLd data={propertyListSchema} />}
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Migas de pan (Breadcrumbs) */}
        <nav aria-label="Migas de pan" className="mb-4 flex items-center gap-1.5 text-xs text-neutral-500">
          <Link href="/" className="hover:text-sage-deep transition-colors">
            Inicio
          </Link>
          <span className="text-neutral-400">/</span>
          <span className="text-neutral-800 font-medium">Propiedades</span>
        </nav>

        <h1 className="mb-1 text-2xl font-semibold text-neutral-900 font-display">
          Propiedades disponibles
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          {total} {total === 1 ? "propiedad encontrada" : "propiedades encontradas"}
        </p>

        <div className="mb-6">
          <PropertyFiltersBar districts={districts} />
        </div>

        {properties.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone p-12 text-center text-ink-soft bg-linen-deep/50">
            No encontramos propiedades con esos filtros. Prueba ajustando el
            rango de precio o el distrito.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-8 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildPageHref(p)}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  p === page
                    ? "bg-sage-deep text-linen font-medium"
                    : "border border-stone bg-white text-ink-soft hover:bg-linen-deep"
                }`}
              >
                {p}
              </Link>
            ))}
          </nav>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
