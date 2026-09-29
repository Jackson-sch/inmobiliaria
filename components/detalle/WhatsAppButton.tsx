import { MessageCircle } from "lucide-react";

function buildWhatsAppUrl(phone: string, message: string): string {
  const digitsOnly = phone.replace(/\D/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppButton({
  phone,
  propertyTitle,
  variant = "inline",
}: {
  phone: string;
  propertyTitle: string;
  variant?: "inline" | "floating";
}) {
  const message = `Hola, estoy interesado/a en la propiedad "${propertyTitle}" que vi en la web. ¿Me das más información?`;
  const href = buildWhatsAppUrl(phone, message);

  if (variant === "floating") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700"
    >
      <MessageCircle className="h-4 w-4" />
      Consultar por WhatsApp
    </a>
  );
}
