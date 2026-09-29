import { getProperties, getAvailableDistricts } from "@/lib/queries/properties";
import { getContactAndSocialSettings } from "@/actions/settings";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HomeHeroSection } from "@/components/home/HomeHeroSection";
import { HomeFeaturedSection } from "@/components/home/HomeFeaturedSection";
import { HomeAboutSection } from "@/components/home/HomeAboutSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { HomeCtaSection } from "@/components/home/HomeCtaSection";

export default async function HomePage() {
  const [propertiesResult, districts, contact] = await Promise.all([
    getProperties({
      featured: true,
      pageSize: 6,
    }).catch(() => ({ properties: [] })),
    getAvailableDistricts().catch(() => []),
    getContactAndSocialSettings().catch(() => ({
      fullName: "Jean Mendocilla",
      phone: "+51 900 000 000",
      whatsapp: "+51 900 000 000",
      email: "contacto@jeanmendocilla.pe",
      mvcsNumber: "PN-14285",
      aboutPhotoUrl: "/jean-mendocilla-exterior.jpg",
      avatarUrl: "/jean-mendocilla-office.jpg",
      facebookUrl: "",
      instagramUrl: "",
      tiktokUrl: "",
      linkedinUrl: "",
      youtubeUrl: "",
    })),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        <HomeHeroSection
          mvcsNumber={contact.mvcsNumber}
          districts={districts}
        />
        <HomeFeaturedSection properties={propertiesResult.properties} />
        <HomeAboutSection
          fullName={contact.fullName}
          mvcsNumber={contact.mvcsNumber}
          aboutPhotoUrl={contact.aboutPhotoUrl}
        />
        <TestimonialsSection />
        <HomeCtaSection
          fullName={contact.fullName}
          phone={contact.phone}
          whatsapp={contact.whatsapp}
          email={contact.email}
          mvcsNumber={contact.mvcsNumber}
        />
      </main>
      <SiteFooter />
    </>
  );
}
