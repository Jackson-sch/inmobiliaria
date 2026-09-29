import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jean Mendocilla | Asesor Inmobiliario en Trujillo",
    short_name: "Jean Mendocilla",
    description:
      "Casas, departamentos y terrenos en venta y alquiler en Trujillo, El Golf, California y Víctor Larco.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f5",
    theme_color: "#1c352d",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
