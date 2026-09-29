import { BedDouble, Bath, Car, Ruler, Calendar, Building2 } from "lucide-react";

interface PropertySpecsProps {
  bedrooms?: number | null;
  bathrooms?: number | null;
  parkingSpots?: number;
  builtAreaM2?: number | null;
  landAreaM2?: number | null;
  yearBuilt?: number | null;
  floors?: number | null;
}

export function PropertySpecs({
  bedrooms,
  bathrooms,
  parkingSpots = 0,
  builtAreaM2,
  landAreaM2,
  yearBuilt,
  floors,
}: PropertySpecsProps) {
  return (
    <dl className="grid grid-cols-2 gap-4 rounded-xl border border-stone bg-white p-5 sm:grid-cols-4 shadow-2xs">
      {bedrooms != null && (
        <div className="flex flex-col items-center gap-1 text-center">
          <BedDouble className="h-5 w-5 text-neutral-400" />
          <dd className="text-sm font-medium text-neutral-900">{bedrooms}</dd>
          <dt className="text-xs text-neutral-500">Dormitorios</dt>
        </div>
      )}
      {bathrooms != null && (
        <div className="flex flex-col items-center gap-1 text-center">
          <Bath className="h-5 w-5 text-neutral-400" />
          <dd className="text-sm font-medium text-neutral-900">{bathrooms}</dd>
          <dt className="text-xs text-neutral-500">Baños</dt>
        </div>
      )}
      {parkingSpots > 0 && (
        <div className="flex flex-col items-center gap-1 text-center">
          <Car className="h-5 w-5 text-neutral-400" />
          <dd className="text-sm font-medium text-neutral-900">{parkingSpots}</dd>
          <dt className="text-xs text-neutral-500">Cocheras</dt>
        </div>
      )}
      {(builtAreaM2 ?? landAreaM2) != null && (
        <div className="flex flex-col items-center gap-1 text-center">
          <Ruler className="h-5 w-5 text-neutral-400" />
          <dd className="text-sm font-medium text-neutral-900">
            {builtAreaM2 ?? landAreaM2} m²
          </dd>
          <dt className="text-xs text-neutral-500">
            {builtAreaM2 ? "Construidos" : "Terreno"}
          </dt>
        </div>
      )}
      {yearBuilt != null && (
        <div className="flex flex-col items-center gap-1 text-center">
          <Calendar className="h-5 w-5 text-neutral-400" />
          <dd className="text-sm font-medium text-neutral-900">{yearBuilt}</dd>
          <dt className="text-xs text-neutral-500">Año</dt>
        </div>
      )}
      {floors != null && (
        <div className="flex flex-col items-center gap-1 text-center">
          <Building2 className="h-5 w-5 text-neutral-400" />
          <dd className="text-sm font-medium text-neutral-900">{floors}</dd>
          <dt className="text-xs text-neutral-500">Pisos</dt>
        </div>
      )}
    </dl>
  );
}
