"use client";

import { useState, useMemo } from "react";
import { Calculator, MessageCircle, HelpCircle, Landmark } from "lucide-react";

interface MortgageCalculatorProps {
  propertyPrice: number;
  currency: "PEN" | "USD";
  propertyTitle: string;
  agentPhone?: string;
  agentName?: string;
}

export function MortgageCalculator({
  propertyPrice,
  currency,
  propertyTitle,
  agentPhone = "+51 900 000 000",
  agentName = "Jean",
}: MortgageCalculatorProps) {
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [termYears, setTermYears] = useState<number>(20);
  const [tea, setTea] = useState<number>(8.5);

  const symbol = currency === "USD" ? "$" : "S/";

  // Cálculos financieros (Método Francés habitual en banca peruana)
  const { downPaymentAmount, loanAmount, monthlyPayment, totalPayment, totalInterest } =
    useMemo(() => {
      const downPayment = (propertyPrice * downPaymentPercent) / 100;
      const principal = Math.max(0, propertyPrice - downPayment);
      const totalMonths = termYears * 12;

      // Tasa mensual efectiva
      const monthlyRate = Math.pow(1 + tea / 100, 1 / 12) - 1;

      // Cuota mensual
      let monthly = 0;
      if (monthlyRate > 0 && principal > 0) {
        monthly =
          (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1);
      }

      const total = monthly * totalMonths;
      const interest = total - principal;

      return {
        downPaymentAmount: downPayment,
        loanAmount: principal,
        monthlyPayment: Math.round(monthly),
        totalPayment: Math.round(total),
        totalInterest: Math.round(interest),
      };
    }, [propertyPrice, downPaymentPercent, termYears, tea]);

  const cleanPhone = (agentPhone || "51900000000").replace(/\D/g, "");
  const waMessage = `Hola ${agentName}, estuve simulando el crédito hipotecario en tu web para la propiedad "${propertyTitle}". Con una cuota inicial de ${symbol} ${downPaymentAmount.toLocaleString("es-PE")} (${downPaymentPercent}%) y un plazo de ${termYears} años, me saldría una cuota estimada de ${symbol} ${monthlyPayment.toLocaleString("es-PE")}/mes. ¿Me podrías asesorar con los requisitos y opciones bancarias?`;

  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="rounded-xl border border-stone bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-stone/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linen text-sage-deep">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-ink">
              Simulador de Crédito Hipotecario
            </h3>
            <p className="text-xs text-neutral-500">
              Estima tu cuota mensual referencial para este inmueble
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-linen px-2.5 py-1 text-[11px] font-medium text-sage-deep">
          <Landmark className="h-3 w-3" />
          Banca Perú
        </span>
      </div>

      {/* Resultado Destacado */}
      <div className="my-5 rounded-xl bg-linen-deep/60 p-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">
            Cuota mensual estimada
          </span>
          <div className="mt-1 font-display text-3xl font-bold text-ink">
            {symbol} {monthlyPayment.toLocaleString("es-PE")}{" "}
            <span className="text-xs font-normal text-neutral-500">/ mes</span>
          </div>
        </div>
        <div className="mt-3 sm:mt-0 text-xs text-neutral-500 sm:text-right">
          <div>
            Monto a financiar:{" "}
            <span className="font-semibold text-ink">
              {symbol} {loanAmount.toLocaleString("es-PE")}
            </span>
          </div>
          <div className="mt-0.5">
            Plazo total: <span className="font-semibold text-ink">{termYears} años</span> ({termYears * 12} meses)
          </div>
        </div>
      </div>

      {/* Controles deslizantes */}
      <div className="space-y-4 text-xs">
        {/* Cuota Inicial */}
        <div>
          <div className="flex justify-between font-medium text-ink mb-1.5">
            <span>Cuota Inicial ({downPaymentPercent}%):</span>
            <span className="font-semibold text-sage-deep">
              {symbol} {downPaymentAmount.toLocaleString("es-PE")}
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={60}
            step={5}
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full accent-sage-deep cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
            <span>10% (mínimo)</span>
            <span>20% (habitual)</span>
            <span>60%</span>
          </div>
        </div>

        {/* Plazo */}
        <div>
          <div className="flex justify-between font-medium text-ink mb-1.5">
            <span>Plazo del préstamo:</span>
            <span className="font-semibold text-sage-deep">{termYears} años</span>
          </div>
          <input
            type="range"
            min={5}
            max={25}
            step={5}
            value={termYears}
            onChange={(e) => setTermYears(Number(e.target.value))}
            className="w-full accent-sage-deep cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
            <span>5 años</span>
            <span>15 años</span>
            <span>25 años</span>
          </div>
        </div>

        {/* Tasa TEA referencial */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-neutral-600 mb-1">
            <span className="flex items-center gap-1">
              Tasa Anual Referencial (TEA):
              <span
                title="Tasa promedio referencial en entidades bancarias peruanas."
                className="inline-flex cursor-help"
              >
                <HelpCircle className="h-3 w-3 text-neutral-400" />
              </span>
            </span>
            <span className="font-semibold text-ink">{tea}%</span>
          </div>
          <input
            type="range"
            min={6.0}
            max={14.0}
            step={0.5}
            value={tea}
            onChange={(e) => setTea(Number(e.target.value))}
            className="w-full accent-sage-deep cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
            <span>6%</span>
            <span>8.5% (mercado actual)</span>
            <span>14%</span>
          </div>
        </div>
      </div>

      {/* CTA Asesoría Financiera */}
      <div className="mt-6 border-t border-stone pt-4">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 text-xs font-medium text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow"
        >
          <MessageCircle className="h-4 w-4" />
          Solicitar Asesoría de Financiamiento por WhatsApp
        </a>
        <p className="mt-2 text-center text-[10px] text-neutral-400 leading-tight">
          * Cuota referencial calculada con sistema francés. No incluye seguros de desgravamen ni comisiones bancarias específicas de cada entidad.
        </p>
      </div>
    </div>
  );
}
