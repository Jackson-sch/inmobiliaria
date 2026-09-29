"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { createLead } from "@/actions/properties";
import { leadFormSchema, type LeadFormInput, type LeadFormValues } from "@/types";

export function HomeContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LeadFormInput, any, LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { source: "web" },
  });

  const onSubmit = async (values: LeadFormValues) => {
    setServerError(null);
    const result = await createLead(values);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-8 text-center backdrop-blur-sm animate-in fade-in">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400 mb-3" />
        <h3 className="font-display text-xl font-semibold text-white">
          ¡Mensaje recibido con éxito!
        </h3>
        <p className="mt-2 text-sm text-neutral-300 max-w-sm mx-auto">
          Gracias por escribir. Jean Mendocilla se comunicará contigo directamente por WhatsApp o llamada a la brevedad.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 rounded-full border border-emerald-400/40 px-5 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-900/50 transition-colors"
        >
          Enviar otra consulta
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md shadow-2xl text-left"
    >
      <div className="mb-6">
        <h3 className="font-display text-xl font-semibold text-white">
          Déjame tu consulta
        </h3>
        <p className="mt-1 text-xs text-neutral-300">
          ¿Interesado en comprar, vender o tasar en Trujillo? Te respondo en menos de 24 horas.
        </p>
      </div>

      <input type="hidden" {...register("source")} value="web" />

      {serverError && (
        <div className="mb-4 rounded-lg bg-red-900/40 border border-red-500/50 p-3 text-xs text-red-200">
          {serverError}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-200 mb-1">
            Nombre y Apellidos *
          </label>
          <input
            {...register("name")}
            placeholder="Ej: Claudia Morales"
            className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-xs text-white placeholder-neutral-400 outline-none transition focus:border-sage focus:bg-white/20"
          />
          {errors.name && (
            <p className="mt-1 text-[11px] text-red-300">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-neutral-200 mb-1">
              Teléfono / WhatsApp *
            </label>
            <input
              type="tel"
              {...register("phone")}
              placeholder="Ej: 949 123 456"
              className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-xs text-white placeholder-neutral-400 outline-none transition focus:border-sage focus:bg-white/20"
            />
            {errors.phone && (
              <p className="mt-1 text-[11px] text-red-300">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-200 mb-1">
              Correo Electrónico (opcional)
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="tu@correo.com"
              className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-xs text-white placeholder-neutral-400 outline-none transition focus:border-sage focus:bg-white/20"
            />
            {errors.email && (
              <p className="mt-1 text-[11px] text-red-300">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-200 mb-1">
            ¿Qué propiedad o zona buscas?
          </label>
          <textarea
            rows={3}
            {...register("message")}
            placeholder="Ej: Busco casa de 3 dormitorios en California o El Golf, presupuesto aprox. $ 180,000..."
            className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-xs text-white placeholder-neutral-400 outline-none transition focus:border-sage focus:bg-white/20 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sage py-3 text-xs font-semibold text-linen shadow-lg transition hover:bg-sage-deep disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          {isSubmitting ? "Enviando mensaje..." : "Enviar consulta sin compromiso"}
        </button>
      </div>
    </form>
  );
}
