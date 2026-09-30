import { headers } from "next/headers";

/**
 * Utilidades para generación de metadatos OpenGraph y compatibilidad
 * estricta con motores de previsualización (WhatsApp, Facebook, LinkedIn, X, Telegram).
 */

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://jeanmendocilla.pe";
}

/**
 * Obtiene la URL del sitio de manera dinámica basada en los headers de la petición entrante.
 * Esto evita el problema de que el scraper de WhatsApp / Facebook reciba una URL canónica
 * errónea o inexistente cuando se prueba en Vercel preview o con un dominio temporal.
 */
export async function getEffectiveSiteUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  try {
    const headerList = await headers();
    const host = headerList.get("x-forwarded-host") || headerList.get("host");
    const proto = headerList.get("x-forwarded-proto") || "https";

    if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      return `${proto}://${host}`;
    }
  } catch {
    // En contextos sin request activo
  }

  return "https://jeanmendocilla.pe";
}

/**
 * Optimiza la URL de una portada para OpenGraph.
 * 
 * Reglas esenciales para WhatsApp / Redes Sociales:
 * 1. Debe ser una URL absoluta https://
 * 2. Debe entregarse en formato JPEG (WhatsApp descarta WebP y rechaza archivos mayores a 300 KB).
 * 3. Proporción recomendada 1200x630 (1.91:1) con recorte inteligente g_auto.
 * 4. Extensión forzada a .jpg para evitar rechazo por discordancia de extensión.
 * 5. Compresión q_75 para garantizar peso ligero (~120-160 KB, bien por debajo del límite estricto de 300 KB).
 */
export function getOptimizedOgImageUrl(rawUrl?: string | null, customSiteUrl?: string): string {
  const siteUrl = customSiteUrl || getSiteUrl();

  if (!rawUrl || rawUrl.trim() === "") {
    return `${siteUrl}/hero-property.jpg`;
  }

  let url = rawUrl.trim();

  // Si es ruta relativa local, convertir en URL pública absoluta
  if (url.startsWith("/")) {
    url = `${siteUrl}${url}`;
  }

  // Si proviene de Unsplash, forzar fm=jpg y tamaño 1200x630
  if (url.includes("images.unsplash.com")) {
    if (url.includes("auto=format")) {
      url = url.replace("auto=format", "fm=jpg&w=1200&h=630&fit=crop&q=75");
    } else if (!url.includes("fm=jpg")) {
      url += (url.includes("?") ? "&" : "?") + "fm=jpg&w=1200&h=630&fit=crop&q=75";
    }
  }

  // Si proviene de Cloudinary:
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    // 1. Forzar extensión .jpg al final del archivo
    url = url.replace(/\.(png|webp|jpeg|avif)$/i, ".jpg");

    // 2. Aplicar transformación Cloudinary optimizada para WhatsApp (< 300 KB)
    if (!url.includes("c_fill") && !url.includes("w_1200")) {
      url = url.replace(
        "/upload/",
        "/upload/c_fill,g_auto,w_1200,h_630,f_jpg,q_75/"
      );
    }
  }

  return url;
}
