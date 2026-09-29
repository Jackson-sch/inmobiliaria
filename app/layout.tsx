import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

import { getOptimizedOgImageUrl, getSiteUrl } from "@/lib/metadata";

const siteUrl = getSiteUrl();
const globalOgImage = getOptimizedOgImageUrl("/jean-mendocilla-banner.jpg");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Jean Mendocilla | Asesor Inmobiliario en Trujillo",
    template: "%s | Jean Mendocilla",
  },
  description:
    "Casas, departamentos y terrenos en venta y alquiler en Trujillo, El Golf, California y Víctor Larco. Asesoría inmobiliaria profesional de principio a fin.",
  keywords: [
    "inmobiliaria trujillo",
    "casas en venta trujillo",
    "departamentos en venta trujillo",
    "departamentos en alquiler trujillo",
    "terrenos en trujillo",
    "bienes raices trujillo",
    "victor larco herrera",
    "el golf trujillo",
    "california trujillo",
    "huanchaco propiedades",
    "asesor inmobiliario trujillo",
    "jean mendocilla",
    "inmobiliaria la libertad peru",
  ],
  authors: [{ name: "Jean Mendocilla", url: siteUrl }],
  creator: "Jean Mendocilla",
  publisher: "Jean Mendocilla Asesoría Inmobiliaria",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: siteUrl,
    siteName: "Jean Mendocilla Asesoría Inmobiliaria",
    images: [
      {
        url: globalOgImage,
        secureUrl: globalOgImage,
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Jean Mendocilla - Asesor Inmobiliario en Trujillo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [globalOgImage],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { getContactAndSocialSettings } from "@/actions/settings";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contact = await getContactAndSocialSettings().catch(() => null);

  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-body antialiased bg-linen text-ink min-h-screen">
        {children}
        <FloatingWhatsApp
          phone={contact?.whatsapp}
          agentName={contact?.fullName?.split(" ")[0]}
        />
      </body>
    </html>
  );
}
