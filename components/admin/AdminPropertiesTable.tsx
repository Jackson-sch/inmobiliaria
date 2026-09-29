"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react";
import { deleteProperty, updatePropertyStatus } from "@/actions/properties";
import type { Property, PropertyStatus } from "@/types";

export function AdminPropertiesTable({
  properties: initialProperties,
}: {
  properties: Property[];
}) {
  const [properties, setProperties] = useState(initialProperties);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  async function handleStatusChange(
    propertyId: string,
    newStatus: PropertyStatus
  ) {
    setUpdatingStatusId(propertyId);
    const res = await updatePropertyStatus(propertyId, newStatus);
    if (res.success) {
      setProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? { ...p, status: newStatus } : p))
      );
    } else {
      alert("Error al actualizar estado: " + res.error);
    }
    setUpdatingStatusId(null);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`¿Estás seguro de eliminar la propiedad "${title}"?`)) {
      return;
    }

    setDeletingId(id);
    const res = await deleteProperty(id);

    if (res.success) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Error al eliminar: " + res.error);
    }
    setDeletingId(null);
  }

  if (properties.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone p-12 text-center text-ink-soft">
        <AlertCircle className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
        <p className="font-medium text-ink">No hay propiedades publicadas aún.</p>
        <p className="text-xs text-neutral-500 mt-1">
          Comienza creando una con el botón "+ Nueva Propiedad".
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-stone bg-white">
      <table className="w-full text-left text-sm text-ink-soft">
        <thead className="border-b border-stone bg-linen text-xs uppercase tracking-wider text-ink-soft">
          <tr>
            <th className="px-4 py-3">Inmueble</th>
            <th className="px-4 py-3">Tipo / Operación</th>
            <th className="px-4 py-3">Precio</th>
            <th className="px-4 py-3">Distrito</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone/60">
          {properties.map((property) => {
            const cover =
              property.images?.find((img) => img.isCover) ?? property.images?.[0];
            const coverUrl = cover?.secureUrl || (cover as any)?.secure_url;

            return (
              <tr key={property.id} className="hover:bg-linen/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 overflow-hidden rounded bg-stone flex-shrink-0">
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[10px] text-neutral-400">
                          Sin foto
                        </span>
                      )}
                    </div>
                    <div className="max-w-xs">
                      <p className="font-medium text-ink line-clamp-1">{property.title}</p>
                      <p className="text-xs text-neutral-400">{property.address || property.district}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize">
                  {property.type} ·{" "}
                  <span className={property.operation === "venta" ? "text-blue-700 font-medium" : "text-amber-700 font-medium"}>
                    {property.operation}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-ink">
                  {property.currency === "USD" ? "$" : "S/"}{" "}
                  {property.price.toLocaleString("es-PE")}
                </td>
                <td className="px-4 py-3">{property.district}</td>
                <td className="px-4 py-3">
                  <div className="relative inline-block">
                    <select
                      value={property.status}
                      disabled={updatingStatusId === property.id}
                      onChange={(e) =>
                        handleStatusChange(property.id, e.target.value as PropertyStatus)
                      }
                      className={`appearance-none rounded-full px-2.5 py-1 text-xs font-semibold pr-6 cursor-pointer border transition-colors outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sage ${
                        property.status === "disponible"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                          : property.status === "reservado"
                          ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                          : property.status === "vendido"
                          ? "bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100"
                          : "bg-neutral-100 text-neutral-600 border-neutral-300 hover:bg-neutral-200"
                      }`}
                    >
                      <option value="disponible">Disponible</option>
                      <option value="reservado">Reservado</option>
                      <option value="vendido">Vendido</option>
                      <option value="inactivo">Inactivo (Ocultar)</option>
                    </select>
                    {updatingStatusId === property.id ? (
                      <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-neutral-500 pointer-events-none" />
                    ) : (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none text-neutral-500">
                        ▼
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/propiedades/${property.slug}`}
                      target="_blank"
                      title="Ver en la web"
                      className="rounded p-1.5 text-neutral-600 hover:bg-linen hover:text-ink"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/propiedades/${property.slug}`}
                      title="Editar y administrar fotos"
                      className="rounded p-1.5 text-neutral-600 hover:bg-linen hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      disabled={deletingId === property.id}
                      onClick={() => handleDelete(property.id, property.title)}
                      title="Eliminar"
                      className="rounded p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                    >
                      {deletingId === property.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
