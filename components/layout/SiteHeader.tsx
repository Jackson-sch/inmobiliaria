import Link from "next/link";
import { getContactAndSocialSettings } from "@/actions/settings";

const NAV_LINKS = [
  { href: "/#nosotros", label: "Sobre mí" },
  { href: "/#contacto", label: "Contacto" },
];

export async function SiteHeader() {
  const contact = await getContactAndSocialSettings();

  return (
    <header className="sticky top-0 z-30 border-b border-stone/70 bg-linen/90 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-lg tracking-tightish text-ink">
          {contact.fullName || "Jean Mendocilla"}
          <span className="ml-2 text-xs font-body font-normal uppercase tracking-[0.18em] text-ink-soft">
            Asesor Inmobiliario
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-ink-soft sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink font-medium">
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/propiedades"
          className="rounded-full bg-ink px-5 py-2 text-sm text-linen transition-colors hover:bg-sage-deep font-medium shadow-xs"
        >
          Explorar propiedades
        </Link>
      </div>
    </header>
  );
}
