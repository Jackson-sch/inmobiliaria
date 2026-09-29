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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jeanmendocilla.pe";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Jean Mendocilla | Asesor Inmobiliario en Trujillo",
    template: "%s | Jean Mendocilla",
  },
  description:
    "Casas, departamentos y terrenos en venta en Trujillo. Asesoría inmobiliaria personalizada, de principio a fin.",
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: siteUrl,
    siteName: "Jean Mendocilla Asesoría Inmobiliaria",
    images: [
      {
        url: "/jean-mendocilla-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Jean Mendocilla - Asesor Inmobiliario en Trujillo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/jean-mendocilla-banner.jpg"],
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
