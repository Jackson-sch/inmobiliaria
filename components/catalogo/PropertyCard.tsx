import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Car, Ruler, MapPin } from "lucide-react";
import type { Property } from "@/types";

function formatPrice(price: number, currency: string): string {
  const symbol = currency === "USD" ? "$" : "S/";
  return `${symbol} ${price.toLocaleString("es-PE")}`;
}

const TYPE_LABELS: Record<string, string> = {
  casa: "Casa",
  departamento: "Departamento",
  terreno: "Terreno",
  oficina: "Oficina",
  local_comercial: "Local comercial",
};

export function PropertyCard({ property }: { property: Property }) {
  const cover =
    property.images?.find((img) => img.isCover) ?? property.images?.[0];
  const coverUrl = cover?.secureUrl || (cover as any)?.secure_url;

  return (
    <Link href={`/propiedades/${property.slug}`} className="group block">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-stone">
        {coverUrl && coverUrl.trim().length > 0 ? (
          <Image
            src={coverUrl}
            alt={property.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-soft">
            Sin fotos
          </div>
        )}

        <span className="absolute left-4 top-4 rounded-full bg-linen/95 px-3 py-1 text-xs tracking-wide text-ink-soft">
          {TYPE_LABELS[property.type] ?? property.type}
        </span>
        {property.operation === "alquiler" && (
          <span className="absolute right-4 top-4 rounded-full bg-bronze px-3 py-1 text-xs text-linen">
            Alquiler
          </span>
        )}
      </div>

      <div className="space-y-1.5 pt-4">
        <div className="flex items-baseline justify-between">
          <p className="font-display text-xl font-semibold text-ink">
            {formatPrice(property.price, property.currency)}
          </p>
          <span className="rounded-md bg-stone/60 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-ink-soft">
            {property.currency}
          </span>
        </div>
        <h3 className="line-clamp-1 text-sm font-medium text-ink">{property.title}</h3>
        <p className="flex items-center gap-1.5 text-xs text-ink-soft line-clamp-1">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-sage-deep" />
          <span>
            {property.address ? `${property.address} · ` : ""}
            {property.district}
          </span>
        </p>

        <div className="flex flex-wrap gap-4 border-t border-stone pt-3 text-xs text-ink-soft">
          {property.bedrooms != null && (
            <span className="flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1.5">
              <Bath className="h-3.5 w-3.5" /> {property.bathrooms}
            </span>
          )}
          {property.parkingSpots > 0 && (
            <span className="flex items-center gap-1.5">
              <Car className="h-3.5 w-3.5" /> {property.parkingSpots}
            </span>
          )}
          {(property.builtAreaM2 ?? property.landAreaM2) != null && (
            <span className="flex items-center gap-1.5">
              <Ruler className="h-3.5 w-3.5" />
              {property.builtAreaM2 ?? property.landAreaM2} m²
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
