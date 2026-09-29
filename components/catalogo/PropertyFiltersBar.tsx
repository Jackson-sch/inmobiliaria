"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { PropertyType, OperationType } from "@/types";

interface PropertyFiltersBarProps {
  districts: string[];
}

const TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: PropertyType.CASA, label: "Casa" },
  { value: PropertyType.DEPARTAMENTO, label: "Departamento" },
  { value: PropertyType.TERRENO, label: "Terreno" },
  { value: PropertyType.OFICINA, label: "Oficina" },
  { value: PropertyType.LOCAL_COMERCIAL, label: "Local comercial" },
];

export function PropertyFiltersBar({ districts }: PropertyFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(
      searchParams.get("priceMin") ||
        searchParams.get("priceMax") ||
        searchParams.get("bedrooms") ||
        searchParams.get("bathrooms") ||
        searchParams.get("areaMin")
    )
  );

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value.trim().length > 0) {
      params.set(key, value.trim());
    } else {
      params.delete(key);
    }
    params.delete("page"); // toda nueva búsqueda vuelve a la página 1
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function clearAllFilters() {
    setQuery("");
    startTransition(() => {
      router.push(pathname);
    });
  }

  const activeFiltersCount = Array.from(searchParams.keys()).filter(
    (k) => k !== "page"
  ).length;

  return (
    <div className="rounded-2xl border border-stone bg-white p-4 shadow-sm mb-8 space-y-4">
      {/* Barra Principal de Búsqueda y Filtros Esenciales */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-center">
        {/* Búsqueda por texto / urbanización */}
        <div className="relative sm:col-span-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParam("query", query);
            }}
            onBlur={() => updateParam("query", query)}
            placeholder="Buscar por urbanización, calle o título..."
            className="w-full rounded-xl border border-neutral-200 bg-linen/40 py-2.5 pl-9 pr-8 text-xs text-ink outline-none transition focus:border-sage-deep focus:bg-white"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                updateParam("query", "");
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Operación */}
        <div className="sm:col-span-2">
          <select
            value={searchParams.get("operation") ?? ""}
            onChange={(e) => updateParam("operation", e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-linen/40 py-2.5 px-3 text-xs text-ink outline-none transition focus:border-sage-deep focus:bg-white"
          >
            <option value="">Venta y Alquiler</option>
            <option value={OperationType.VENTA}>Venta</option>
            <option value={OperationType.ALQUILER}>Alquiler</option>
          </select>
        </div>

        {/* Tipo de propiedad */}
        <div className="sm:col-span-2">
          <select
            value={searchParams.get("type") ?? ""}
            onChange={(e) => updateParam("type", e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-linen/40 py-2.5 px-3 text-xs text-ink outline-none transition focus:border-sage-deep focus:bg-white"
          >
            <option value="">Todos los tipos</option>
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ubicación / Distrito */}
        <div className="sm:col-span-2">
          <select
            value={searchParams.get("district") ?? ""}
            onChange={(e) => updateParam("district", e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-linen/40 py-2.5 px-3 text-xs text-ink outline-none transition focus:border-sage-deep focus:bg-white"
          >
            <option value="">Todos los distritos</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Moneda */}
        <div className="sm:col-span-2">
          <select
            value={searchParams.get("currency") ?? ""}
            onChange={(e) => updateParam("currency", e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-linen/40 py-2.5 px-3 text-xs font-medium text-ink outline-none transition focus:border-sage-deep focus:bg-white"
          >
            <option value="">Moneda: Todas</option>
            <option value="USD">Dólares ($ USD)</option>
            <option value="PEN">Soles (S/ PEN)</option>
          </select>
        </div>
      </div>

      {/* Barra de Filtros Avanzados y Acciones */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone/60 text-xs">
        <button
          type="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 font-medium transition-colors ${
            showAdvanced ? "text-sage-deep" : "text-ink-soft hover:text-ink"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>{showAdvanced ? "Ocultar filtros avanzados" : "Filtros avanzados (precio, dormitorios, área)"}</span>
        </button>

        <div className="flex items-center gap-3">
          {isPending && (
            <span className="text-[11px] text-sage-deep animate-pulse">
              Actualizando catálogo...
            </span>
          )}

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 hover:text-red-700"
            >
              <RotateCcw className="h-3 w-3" />
              Limpiar filtros ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {/* Panel Desplegable de Filtros Avanzados */}
      {showAdvanced && (
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-dashed border-stone/80 sm:grid-cols-5 animate-in fade-in">
          {/* Precio Mínimo */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Precio Mínimo
            </label>
            <input
              type="number"
              placeholder="Ej: 50000"
              defaultValue={searchParams.get("priceMin") ?? ""}
              onBlur={(e) => updateParam("priceMin", e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-linen/20 px-3 py-2 text-xs text-ink outline-none focus:border-sage-deep focus:bg-white"
            />
          </div>

          {/* Precio Máximo */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Precio Máximo
            </label>
            <input
              type="number"
              placeholder="Ej: 300000"
              defaultValue={searchParams.get("priceMax") ?? ""}
              onBlur={(e) => updateParam("priceMax", e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-linen/20 px-3 py-2 text-xs text-ink outline-none focus:border-sage-deep focus:bg-white"
            />
          </div>

          {/* Dormitorios */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Dormitorios
            </label>
            <select
              value={searchParams.get("bedrooms") ?? ""}
              onChange={(e) => updateParam("bedrooms", e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-linen/20 px-3 py-2 text-xs text-ink outline-none focus:border-sage-deep focus:bg-white"
            >
              <option value="">Cualquiera</option>
              <option value="1">1+ dorm.</option>
              <option value="2">2+ dorm.</option>
              <option value="3">3+ dorm.</option>
              <option value="4">4+ dorm.</option>
              <option value="5">5+ dorm.</option>
            </select>
          </div>

          {/* Baños */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Baños
            </label>
            <select
              value={searchParams.get("bathrooms") ?? ""}
              onChange={(e) => updateParam("bathrooms", e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-linen/20 px-3 py-2 text-xs text-ink outline-none focus:border-sage-deep focus:bg-white"
            >
              <option value="">Cualquiera</option>
              <option value="1">1+ baños</option>
              <option value="2">2+ baños</option>
              <option value="3">3+ baños</option>
              <option value="4">4+ baños</option>
            </select>
          </div>

          {/* Área Construida Mínima */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Área Mínima (m²)
            </label>
            <select
              value={searchParams.get("areaMin") ?? ""}
              onChange={(e) => updateParam("areaMin", e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-linen/20 px-3 py-2 text-xs text-ink outline-none focus:border-sage-deep focus:bg-white"
            >
              <option value="">Cualquiera</option>
              <option value="60">Desde 60 m²</option>
              <option value="90">Desde 90 m²</option>
              <option value="120">Desde 120 m²</option>
              <option value="180">Desde 180 m²</option>
              <option value="250">Desde 250 m²</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
