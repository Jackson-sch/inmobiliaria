import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PropertyCard } from "@/components/catalogo/PropertyCard";
import type { Property } from "@/types";

interface HomeFeaturedSectionProps {
  properties: Property[];
}

export function HomeFeaturedSection({ properties }: HomeFeaturedSectionProps) {
  if (!properties || properties.length === 0) return null;

  return (
    <section className="border-t border-stone bg-linen-deep">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sage-deep font-semibold">
              Selección actual
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink">
              Propiedades destacadas
            </h2>
          </div>
          <Link
            href="/propiedades"
            className="hidden items-center gap-1 text-sm text-ink-soft hover:text-ink sm:flex font-medium"
          >
            Ver todas
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
