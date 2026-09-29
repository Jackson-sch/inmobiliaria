import { MapPin, ExternalLink } from "lucide-react";

interface PropertyLocationMapProps {
  mapEmbedSrc: string;
  title: string;
  address?: string | null;
  district: string;
  city: string;
}

export function PropertyLocationMap({
  mapEmbedSrc,
  title,
  address,
  district,
  city,
}: PropertyLocationMapProps) {
  const gmapsQuery = encodeURIComponent(
    `${address ? `${address}, ` : ""}${district}, ${city}, Perú`
  );

  return (
    <div className="rounded-xl border border-stone bg-white p-6 print:break-inside-avoid shadow-2xs">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-medium text-neutral-900 font-display text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-sage-deep" />
          Ubicación y Entorno
        </h2>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${gmapsQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-sage-deep hover:underline"
        >
          Ver en Google Maps
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <iframe
        src={mapEmbedSrc}
        className="h-72 w-full rounded-xl border border-stone"
        loading="lazy"
        title={`Ubicación de ${title}`}
      />
      <p className="mt-2 text-xs text-neutral-400">
        Ubicación referencial: {address ? `${address}, ` : ""}
        {district}, {city}.
      </p>
    </div>
  );
}
