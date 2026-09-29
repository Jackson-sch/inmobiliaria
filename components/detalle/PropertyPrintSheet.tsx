interface PropertyPrintHeaderProps {
  agentName: string;
  agentPhone: string;
  mvcsNumber?: string;
  propertySlug: string;
}

export function PropertyPrintHeader({
  agentName,
  agentPhone,
  mvcsNumber,
  propertySlug,
}: PropertyPrintHeaderProps) {
  return (
    <div className="hidden print:block mb-8 border-b-2 border-stone-deep pb-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-sage-deep">
            Ficha Técnica Inmobiliaria {mvcsNumber ? `· Registro MVCS ${mvcsNumber}` : ""}
          </span>
          <h2 className="font-display text-2xl font-bold text-ink mt-0.5 uppercase">
            {agentName}
          </h2>
          <p className="text-xs text-ink-soft">
            Asesoría Inmobiliaria Profesional · Trujillo, La Libertad
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            WhatsApp / Celular: {agentPhone} · Web: jeanmendocilla.pe
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block rounded-md border border-stone bg-linen px-3 py-1 text-xs font-semibold text-ink">
            Ref: {propertySlug}
          </span>
          <p className="text-[10px] text-neutral-400 mt-1">
            Documento Oficial
          </p>
        </div>
      </div>
    </div>
  );
}

interface PropertyPrintFooterProps {
  agentName: string;
  agentPhone: string;
}

export function PropertyPrintFooter({
  agentName,
  agentPhone,
}: PropertyPrintFooterProps) {
  return (
    <div className="hidden print:block mt-12 border-t-2 border-stone-deep pt-4">
      <div className="flex items-center justify-between text-xs text-neutral-600">
        <div>
          <p className="font-semibold text-ink">{agentName} — Asesoría Inmobiliaria</p>
          <p className="mt-0.5">Para coordinar una visita o consultas sobre esta propiedad, contáctame directamente.</p>
          <p className="mt-0.5 font-medium text-sage-deep">Tel / WhatsApp: {agentPhone}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[11px] text-ink">jeanmendocilla.pe</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">Ficha informativa generada para clientes.</p>
        </div>
      </div>
    </div>
  );
}
