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
 * Optimiza la URL de una portada para OpenGraph.
 * 
 * Reglas esenciales para WhatsApp / Redes Sociales:
 * 1. Debe ser una URL absoluta https://
 * 2. Debe entregarse en formato JPEG o PNG (WhatsApp descarta WebP/AVIF en og:image).
 * 3. Proporción recomendada 1200x630 (1.91:1) para que no se recorte.
 */
export function getOptimizedOgImageUrl(rawUrl?: string | null): string {
  const siteUrl = getSiteUrl();

  if (!rawUrl || rawUrl.trim() === "") {
    return `${siteUrl}/hero-property.jpg`;
  }

  let url = rawUrl.trim();

  // Si es ruta relativa local, convertir en URL pública absoluta
  if (url.startsWith("/")) {
    url = `${siteUrl}${url}`;
  }

  // Si proviene de Unsplash, forzar fm=jpg (Unsplash por defecto puede devolver WebP)
  if (url.includes("images.unsplash.com")) {
    if (url.includes("auto=format")) {
      url = url.replace("auto=format", "fm=jpg");
    } else if (!url.includes("fm=jpg")) {
      url += (url.includes("?") ? "&" : "?") + "fm=jpg";
    }
  }

  // Si proviene de Cloudinary, aplicar transformación de 1200x630 en formato JPEG optimizado
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    if (!url.includes("f_jpg")) {
      url = url.replace("/upload/", "/upload/c_fill,w_1200,h_630,f_jpg,q_auto:good/");
    }
  }

  return url;
}
