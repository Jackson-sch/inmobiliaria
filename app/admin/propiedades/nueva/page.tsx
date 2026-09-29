import { redirect } from "next/navigation";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Nueva Propiedad | Panel de Administración",
};

export default async function NuevaPropiedadPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [{ data: amenitiesData }, { data: agentData }] = await Promise.all([
    supabase.from("amenities").select("id, name, icon").order("name"),
    supabase.from("agents").select("id").limit(1).maybeSingle(),
  ]);

  const amenities = amenitiesData ?? [];
  const agentId = agentData?.id ?? "00000000-0000-0000-0000-000000000000";

  return (
    <div className="min-h-screen bg-linen-deep/40">
      <AdminHeader userEmail={user.email} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink">
            Nueva Propiedad
          </h1>
          <p className="text-xs text-ink-soft">
            Ingresa los detalles técnicos, precio y características del inmueble.
          </p>
        </div>

        <div className="rounded-2xl border border-stone bg-white p-6 sm:p-8 shadow-sm">
          <PropertyForm agentId={agentId} amenities={amenities} />
        </div>
      </main>
    </div>
  );
}
