import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/metadata";
import { getPropertiesForSitemap } from "@/lib/queries/properties";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const properties = await getPropertiesForSitemap();

  const propertyUrls: MetadataRoute.Sitemap = properties.map((prop) => ({
    url: `${siteUrl}/propiedades/${prop.slug}`,
    lastModified: new Date(prop.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${siteUrl}/propiedades`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    ...propertyUrls,
  ];
}
