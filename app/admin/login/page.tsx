"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Lock, Mail, ShieldAlert } from "lucide-react";
import { login } from "@/actions/auth";

export default function AdminLoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await login(formData);

    if (res?.error) {
      setErrorMessage(res.error);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linen px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-stone bg-white p-8 shadow-sm">
        <div className="text-center">
          <Link href="/" className="font-display text-2xl tracking-tightish text-ink">
            Jean Mendocilla
          </Link>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-sage-deep font-semibold">
            Panel de Administración
          </p>
          <h2 className="mt-6 text-xl font-semibold text-neutral-900 font-display">
            Acceso Administrativo
          </h2>
          <p className="mt-2 text-xs text-ink-soft">
            Ingresa tus credenciales autorizadas para gestionar propiedades y contactos.
          </p>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@ejemplo.com"
                className="w-full rounded-md border border-neutral-300 py-2 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-sage-deep focus:ring-2 focus:ring-sage/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-md border border-neutral-300 py-2 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-sage-deep focus:ring-2 focus:ring-sage/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-ink py-2.5 text-sm font-medium text-linen transition-colors hover:bg-sage-deep disabled:opacity-60 shadow-xs"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar al panel
          </button>
        </form>

        <div className="flex items-center justify-between border-t border-stone pt-4 text-xs text-ink-soft">
          <span className="text-[11px] text-neutral-400">
            Área protegida · Acceso restringido
          </span>
          <Link href="/" className="text-sage-deep hover:underline font-medium">
            Volver a la web
          </Link>
        </div>
      </div>
    </div>
  );
}
