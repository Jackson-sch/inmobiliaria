"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { createLead } from "@/actions/leads";
import { leadFormSchema, type LeadFormInput, type LeadFormValues } from "@/types";

export function ContactForm({ propertyId }: { propertyId: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormInput, any, LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { propertyId, source: "web" },
  });

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        <p className="font-medium text-emerald-800">¡Mensaje enviado!</p>
        <p className="text-sm text-emerald-700">
          Te contactaremos a la brevedad para darte más información.
        </p>
      </div>
    );
  }

  const onSubmit = async (values: LeadFormValues) => {
    setServerError(null);
    const result = await createLead(values);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    setSubmitted(true);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 rounded-xl border border-neutral-200 p-5"
    >
      <h3 className="font-medium text-neutral-900">
        ¿Te interesa esta propiedad?
      </h3>

      <input type="hidden" {...register("propertyId")} />
      <input type="hidden" {...register("source")} value="web" />

      {serverError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {serverError}
        </p>
      )}

      <div>
        <input
          {...register("name")}
          placeholder="Tu nombre"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <input
          {...register("phone")}
          placeholder="Tu teléfono"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <input
          {...register("email")}
          placeholder="Tu email (opcional)"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <textarea
          {...register("message")}
          rows={3}
          placeholder="Cuéntanos qué te gustaría saber (opcional)"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Enviar mensaje
      </button>
    </form>
  );
}
