"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Home, MapPin } from "lucide-react";
import { PropertyType } from "@/types";

interface HeroSearchBarProps {
  districts: string[];
}

const TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: PropertyType.CASA, label: "Casa" },
  { value: PropertyType.DEPARTAMENTO, label: "Departamento" },
  { value: PropertyType.TERRENO, label: "Terreno" },
  { value: PropertyType.OFICINA, label: "Oficina" },
  { value: PropertyType.LOCAL_COMERCIAL, label: "Local comercial" },
];

export function HeroSearchBar({ districts }: HeroSearchBarProps) {
  const router = useRouter();
  const [operation, setOperation] = useState<string>("venta");
  const [query, setQuery] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [district, setDistrict] = useState<string>("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (operation) params.set("operation", operation);
    if (query.trim()) params.set("query", query.trim());
    if (type) params.set("type", type);
    if (district) params.set("district", district);

    router.push(`/propiedades?${params.toString()}`);
  };

  return (
    <div className="w-full rounded-2xl border border-stone bg-white/95 p-3 shadow-lg backdrop-blur-sm sm:p-4">
      {/* Pestañas de operación (Venta / Alquiler) */}
      <div className="flex gap-2 border-b border-stone/60 pb-3">
        <button
          type="button"
          onClick={() => setOperation("venta")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
            operation === "venta"
              ? "bg-ink text-linen shadow-xs"
              : "text-ink-soft hover:bg-linen"
          }`}
        >
          Comprar
        </button>
        <button
          type="button"
          onClick={() => setOperation("alquiler")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
            operation === "alquiler"
              ? "bg-ink text-linen shadow-xs"
              : "text-ink-soft hover:bg-linen"
          }`}
        >
          Alquilar
        </button>
      </div>

      {/* Formulario de Búsqueda Rápida */}
      <form
        onSubmit={handleSearch}
        className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-12 sm:items-center"
      >
        {/* Búsqueda por Urbanización o palabra clave */}
        <div className="relative sm:col-span-4">
          <label className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 pl-1">
            Urbanización o Referencia
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: California, El Golf, San Andrés..."
              className="w-full rounded-lg border border-neutral-200 bg-linen/50 py-2.5 pl-9 pr-3 text-xs font-medium text-ink outline-none transition-colors focus:border-sage-deep focus:bg-white"
            />
          </div>
        </div>

        {/* Tipo de propiedad */}
        <div className="relative sm:col-span-3">
          <label className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 pl-1">
            Tipo de Inmueble
          </label>
          <div className="relative">
            <Home className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full appearance-none rounded-lg border border-neutral-200 bg-linen/50 py-2.5 pl-9 pr-8 text-xs font-medium text-ink outline-none transition-colors focus:border-sage-deep focus:bg-white"
            >
              <option value="">Todos los tipos</option>
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Distrito */}
        <div className="relative sm:col-span-3">
          <label className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 pl-1">
            Ubicación
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full appearance-none rounded-lg border border-neutral-200 bg-linen/50 py-2.5 pl-9 pr-8 text-xs font-medium text-ink outline-none transition-colors focus:border-sage-deep focus:bg-white"
            >
              <option value="">Todos los distritos</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón Buscar */}
        <div className="sm:col-span-2 sm:self-end">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-sage px-4 py-2.5 text-xs font-medium text-linen shadow-sm transition-all hover:bg-sage-deep hover:shadow"
          >
            <Search className="h-3.5 w-3.5" />
            Buscar
          </button>
        </div>
      </form>
    </div>
  );
}
