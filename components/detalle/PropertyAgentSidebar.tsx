import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { WhatsAppButton } from "@/components/detalle/WhatsAppButton";
import { ContactForm } from "@/components/detalle/ContactForm";

interface PropertyAgentSidebarProps {
  agentName: string;
  agentPhone: string;
  avatarUrl: string;
  mvcsNumber?: string;
  propertyTitle: string;
  propertyId: string;
}

export function PropertyAgentSidebar({
  agentName,
  agentPhone,
  avatarUrl,
  mvcsNumber,
  propertyTitle,
  propertyId,
}: PropertyAgentSidebarProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start print:hidden">
      {/* Tarjeta del Asesor */}
      <div className="rounded-xl border border-stone bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-sage/40 bg-stone shrink-0 shadow-inner">
            <Image
              src={avatarUrl}
              alt={agentName}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
          <div>
            <h3 className="font-display font-semibold text-ink text-base">
              {agentName}
            </h3>
            <p className="text-xs text-sage-deep font-medium">
              Asesor Inmobiliario · Trujillo
            </p>
            {mvcsNumber && (
              <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-fit border border-emerald-100">
                <ShieldCheck className="h-3 w-3" />
                <span>Registro MVCS: {mvcsNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {agentPhone && (
        <WhatsAppButton
          phone={agentPhone}
          propertyTitle={propertyTitle}
        />
      )}

      <ContactForm propertyId={propertyId} />
    </aside>
  );
}
