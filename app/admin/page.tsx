import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Building, Users, CheckCircle, Clock } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminPropertiesTable } from "@/components/admin/AdminPropertiesTable";
import type { Property, Lead } from "@/types";

export const metadata = {
  title: "Panel de Control | Jean Mendocilla Inmobiliaria",
};

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Cargar propiedades
  const { data: propertiesRaw } = await supabase
    .from("properties")
    .select(
      `
      id, agent_id, title, slug, description, type, operation, status,
      price, currency, address, district, city, latitude, longitude,
      land_area_m2, built_area_m2, bedrooms, bathrooms, parking_spots,
      floors, year_built, featured, views_count, created_at, updated_at,
      images:property_images(id, secure_url, is_cover, sort_order)
      `
    )
    .order("created_at", { ascending: false });

  const properties: Property[] = (propertiesRaw ?? []).map((row: any) => ({
    id: row.id,
    agentId: row.agent_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    type: row.type,
    operation: row.operation,
    status: row.status,
    price: row.price,
    currency: row.currency,
    address: row.address,
    district: row.district,
    city: row.city,
    latitude: row.latitude,
    longitude: row.longitude,
    landAreaM2: row.land_area_m2,
    builtAreaM2: row.built_area_m2,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    parkingSpots: row.parking_spots,
    floors: row.floors,
    yearBuilt: row.year_built,
    featured: row.featured,
    viewsCount: row.views_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    images: (row.images ?? [])
      .map((img: any) => ({
        id: img.id,
        propertyId: row.id,
        cloudinaryPublicId: img.cloudinary_public_id ?? "",
        secureUrl: img.secure_url ?? "",
        width: img.width ?? null,
        height: img.height ?? null,
        format: img.format ?? null,
        isCover: img.is_cover ?? false,
        sortOrder: img.sort_order ?? 0,
        createdAt: img.created_at ?? "",
      }))
      .sort((a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder),
  }));

  // Cargar leads
  const { data: leadsRaw } = await supabase
    .from("leads")
    .select(
      `
      id, property_id, name, phone, email, message, source, status, created_at,
      property:properties(title, slug)
      `
    )
    .order("created_at", { ascending: false })
    .limit(20);

  const leads = (leadsRaw ?? []) as any[];

  // Métricas
  const totalCount = properties.length;
  const disponiblesCount = properties.filter((p) => p.status === "disponible").length;
  const ventasCount = properties.filter((p) => p.operation === "venta").length;
  const alquilerCount = properties.filter((p) => p.operation === "alquiler").length;

  return (
    <div className="min-h-screen bg-linen-deep/40">
      <AdminHeader userEmail={user.email} />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink">
              Panel de Control
            </h1>
            <p className="text-sm text-ink-soft">
              Administración de propiedades inmobiliarias y prospectos de clientes.
            </p>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-stone bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs uppercase tracking-wider font-medium">Inmuebles</span>
              <Building className="h-4 w-4" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-ink">{totalCount}</p>
            <p className="text-xs text-neutral-400 mt-1">{disponiblesCount} activos actualmente</p>
          </div>

          <div className="rounded-xl border border-stone bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs uppercase tracking-wider font-medium">En Venta</span>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-ink">{ventasCount}</p>
            <p className="text-xs text-neutral-400 mt-1">propiedades en catálogo</p>
          </div>

          <div className="rounded-xl border border-stone bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs uppercase tracking-wider font-medium">En Alquiler</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-ink">{alquilerCount}</p>
            <p className="text-xs text-neutral-400 mt-1">propiedades en catálogo</p>
          </div>

          <div className="rounded-xl border border-stone bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs uppercase tracking-wider font-medium">Leads / Consultas</span>
              <Users className="h-4 w-4 text-sage-deep" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-ink">{leads.length}</p>
            <p className="text-xs text-neutral-400 mt-1">mensajes recibidos</p>
          </div>
        </div>

        {/* Sección de Propiedades */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-ink">
              Propiedades en Cartera
            </h2>
            <Link
              href="/admin/propiedades/nueva"
              className="text-xs text-sage-deep font-medium hover:underline"
            >
              + Agregar nueva propiedad
            </Link>
          </div>
          <AdminPropertiesTable properties={properties} />
        </section>

        {/* Sección de Leads / Contactos */}
        <section>
          <h2 className="font-display text-xl font-semibold text-ink mb-4">
            Prospectos Recientes (Leads)
          </h2>
          {leads.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone p-8 text-center text-xs text-ink-soft bg-white">
              No hay mensajes de contacto registrados todavía.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-stone bg-white">
              <table className="w-full text-left text-sm text-ink-soft">
                <thead className="border-b border-stone bg-linen text-xs uppercase tracking-wider text-ink-soft">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Teléfono</th>
                    <th className="px-4 py-3">Propiedad</th>
                    <th className="px-4 py-3">Mensaje</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3 text-right">Contactar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone/60">
                  {leads.map((lead: any) => {
                    const cleanPhone = lead.phone.replace(/\D/g, "");
                    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      `Hola ${lead.name}, te saludo de parte de Jean Mendocilla sobre tu consulta inmobiliaria.`
                    )}`;

                    return (
                      <tr key={lead.id} className="hover:bg-linen/50">
                        <td className="px-4 py-3 font-medium text-ink">{lead.name}</td>
                        <td className="px-4 py-3">{lead.phone}</td>
                        <td className="px-4 py-3">
                          {lead.property ? (
                            <Link
                              href={`/propiedades/${lead.property.slug}`}
                              target="_blank"
                              className="text-sage-deep hover:underline line-clamp-1"
                            >
                              {lead.property.title}
                            </Link>
                          ) : (
                            <span className="text-neutral-400">Consulta general</span>
                          )}
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate text-xs">
                          {lead.message || "Sin mensaje"}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                          {new Date(lead.created_at).toLocaleDateString("es-PE")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                          >
                            <MessageCircle className="h-3 w-3" />
                            WhatsApp
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
