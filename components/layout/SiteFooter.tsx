import Link from "next/link";
import { getContactAndSocialSettings } from "@/actions/settings";

export async function SiteFooter() {
  const contact = await getContactAndSocialSettings().catch(() => ({
    fullName: "Jean Mendocilla",
    phone: "+51 900 000 000",
    whatsapp: "+51 900 000 000",
    email: "contacto@jeanmendocilla.pe",
    mvcsNumber: "PN-14285",
    facebookUrl: "https://www.facebook.com/jean.mendocillasebastian",
    instagramUrl: "",
    tiktokUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
  }));

  const cleanPhone = contact.whatsapp.replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanPhone}`;

  return (
    <footer className="border-t border-stone/70 bg-linen-deep print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-lg text-ink font-semibold">{contact.fullName}</p>
          <p className="mt-1 text-sm text-ink-soft leading-relaxed">
            Asesoría inmobiliaria profesional en Trujillo — casas, departamentos y
            terrenos, acompañándote con total seguridad jurídica.
          </p>
          {contact.mvcsNumber && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-stone bg-linen px-3 py-1 text-[11px] font-medium text-sage-deep">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
              <span>Registro MVCS: {contact.mvcsNumber}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-12 text-sm">
          <div className="space-y-2">
            <p className="font-medium text-ink">Explorar</p>
            <Link href="/propiedades" className="block text-ink-soft hover:text-ink">
              Propiedades
            </Link>
            <Link href="/#nosotros" className="block text-ink-soft hover:text-ink">
              Sobre mí
            </Link>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-ink">Contacto</p>
            {contact.whatsapp && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-ink-soft hover:text-ink"
              >
                WhatsApp ({contact.whatsapp})
              </a>
            )}
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="block text-ink-soft hover:text-ink"
              >
                {contact.email}
              </a>
            )}
            <Link href="/#contacto" className="block text-ink-soft hover:text-ink">
              Formulario de consulta
            </Link>
          </div>

          {/* Redes Sociales dinámicas */}
          {(contact.facebookUrl ||
            contact.instagramUrl ||
            contact.tiktokUrl ||
            contact.linkedinUrl ||
            contact.youtubeUrl) && (
            <div className="space-y-2">
              <p className="font-medium text-ink">Redes Sociales</p>
              {contact.facebookUrl && (
                <a
                  href={contact.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-ink-soft hover:text-ink"
                >
                  Facebook
                </a>
              )}
              {contact.instagramUrl && (
                <a
                  href={contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-ink-soft hover:text-ink"
                >
                  Instagram
                </a>
              )}
              {contact.tiktokUrl && (
                <a
                  href={contact.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-ink-soft hover:text-ink"
                >
                  TikTok
                </a>
              )}
              {contact.linkedinUrl && (
                <a
                  href={contact.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-ink-soft hover:text-ink"
                >
                  LinkedIn
                </a>
              )}
              {contact.youtubeUrl && (
                <a
                  href={contact.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-ink-soft hover:text-ink"
                >
                  YouTube
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-stone/70 py-4 px-6 text-center text-xs text-ink-soft flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto gap-2">
        <span>
          © {new Date().getFullYear()} {contact.fullName} · Trujillo, La Libertad · Agente Inmobiliario
        </span>
        <Link href="/admin" className="text-neutral-400 hover:text-ink transition-colors">
          Panel Asesor
        </Link>
      </div>
    </footer>
  );
}
