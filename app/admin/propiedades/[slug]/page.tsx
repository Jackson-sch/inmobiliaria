import { notFound, redirect } from "next/navigation";
import { getPropertyBySlug } from "@/lib/queries/properties";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { AdminHeader } from "@/components/admin/AdminHeader";

interface EditPropertyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EditPropertyPageProps) {
  const { slug } = await params;
  return {
    title: `Editar: ${slug} | Panel Inmobiliario`,
  };
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [property, { data: amenitiesData }] = await Promise.all([
    getPropertyBySlug(slug),
    supabase.from("amenities").select("id, name, icon").order("name"),
  ]);

  if (!property) {
    notFound();
  }

  const amenities = amenitiesData ?? [];

  return (
    <div className="min-h-screen bg-linen-deep/40">
      <AdminHeader userEmail={user.email} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink">
            Editar Propiedad
          </h1>
          <p className="text-xs text-ink-soft">
            Modifica los detalles, amenidades o administra la galería de fotos.
          </p>
        </div>

        <div className="rounded-2xl border border-stone bg-white p-6 sm:p-8 shadow-sm">
          <PropertyForm
            agentId={property.agentId}
            amenities={amenities}
            property={property}
          />
        </div>
      </main>
    </div>
  );
}
