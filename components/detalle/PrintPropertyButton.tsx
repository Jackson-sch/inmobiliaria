"use client";

import { Printer } from "lucide-react";

export function PrintPropertyButton() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="inline-flex items-center gap-2 rounded-xl border border-stone bg-white px-3.5 py-2 text-xs font-medium text-ink shadow-xs transition-colors hover:border-sage-deep hover:bg-linen hover:text-sage-deep print:hidden"
      title="Imprimir ficha o guardar como PDF"
      aria-label="Imprimir ficha o guardar como PDF"
    >
      <Printer className="h-4 w-4 text-neutral-500" />
      <span className="hidden sm:inline">Ficha PDF</span>
    </button>
  );
}
