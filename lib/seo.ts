import type { Property } from "@/types";
import type { ContactAndSocialConfig } from "@/actions/settings";

/**
 * Genera el esquema Schema.org JSON-LD para la agencia / asesor inmobiliario (RealEstateAgent).
 */
export function buildRealEstateAgentSchema(
  contact: ContactAndSocialConfig,
  siteUrl: string
) {
  const sameAs: string[] = [
    contact.facebookUrl,
    contact.instagramUrl,
    contact.tiktokUrl,
    contact.linkedinUrl,
    contact.youtubeUrl,
  ].filter(Boolean) as string[];

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${siteUrl}/#organization`,
    name: `${contact.fullName} | Asesoría Inmobiliaria`,
    alternateName: "Jean Mendocilla Inmobiliaria",
    description:
      "Asesoría inmobiliaria personalizada para compra, venta y alquiler de casas, departamentos y terrenos en Trujillo, La Libertad.",
    url: siteUrl,
    logo: `${siteUrl}/icon.png`,
    image: `${siteUrl}/jean-mendocilla-banner.jpg`,
    telephone: contact.phone || contact.whatsapp,
    email: contact.email,
    priceRange: "$$ - $$$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Trujillo",
      addressRegion: "La Libertad",
      addressCountry: "PE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -8.1118,
      longitude: -79.0287,
    },
    areaServed: [
      {
        "@type": "City",
        name: "Trujillo",
      },
      {
        "@type": "AdministrativeArea",
        name: "Víctor Larco Herrera",
      },
      {
        "@type": "AdministrativeArea",
        name: "Huanchaco",
      },
      {
        "@type": "AdministrativeArea",
        name: "La Libertad",
      },
    ],
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };
}

const TYPE_TO_SCHEMA: Record<string, string> = {
  casa: "SingleFamilyResidence",
  departamento: "Apartment",
  terreno: "LandParcel",
  oficina: "Office",
  local_comercial: "CommercialRealEstate",
};

/**
 * Genera el esquema Schema.org JSON-LD para una propiedad individual.
 */
export function buildPropertySchema(property: Property, siteUrl: string) {
  const schemaType = TYPE_TO_SCHEMA[property.type] || "RealEstateListing";
  const propertyUrl = `${siteUrl}/propiedades/${property.slug}`;
  const images = property.images?.map((img) => img.secureUrl).filter(Boolean) ?? [];

  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    "@id": propertyUrl,
    name: property.title,
    description: property.description,
    url: propertyUrl,
    image: images.length > 0 ? images : [`${siteUrl}/hero-property.jpg`],
    numberOfRooms: property.bedrooms || undefined,
    numberOfBathroomsTotal: property.bathrooms || undefined,
    floorSize:
      property.builtAreaM2 || property.landAreaM2
        ? {
            "@type": "QuantitativeValue",
            value: property.builtAreaM2 || property.landAreaM2,
            unitCode: "MTK",
          }
        : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.district,
      addressRegion: property.city,
      addressCountry: "PE",
    },
    geo:
      property.latitude && property.longitude
        ? {
            "@type": "GeoCoordinates",
            latitude: property.latitude,
            longitude: property.longitude,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: property.currency,
      availability:
        property.status === "disponible"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      url: propertyUrl,
      businessFunction:
        property.operation === "venta"
          ? "https://schema.org/SellAction"
          : "https://schema.org/RentAction",
      seller: {
        "@type": "RealEstateAgent",
        name: "Jean Mendocilla",
        url: siteUrl,
      },
    },
  };
}

/**
 * Genera migas de pan (BreadcrumbList) para mejorar la visualización en Google Search.
 */
export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Genera ItemList para páginas de listado o catálogo de propiedades.
 */
export function buildPropertyListSchema(
  properties: Property[],
  siteUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: properties.map((prop, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${siteUrl}/propiedades/${prop.slug}`,
      name: prop.title,
    })),
  };
}
