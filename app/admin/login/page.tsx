"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Lock, Mail } from "lucide-react";
import { login, signup } from "@/actions/auth";

export default function AdminLoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const action = isRegisterMode ? signup : login;
    const res = await action(formData);

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
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-sage-deep">
            Panel de Administración
          </p>
          <h2 className="mt-6 text-xl font-semibold text-neutral-900 font-display">
            {isRegisterMode ? "Crear cuenta administrativa" : "Iniciar Sesión"}
          </h2>
          <p className="mt-2 text-xs text-ink-soft">
            {isRegisterMode
              ? "Registra las credenciales para gestionar el catálogo inmobiliario"
              : "Ingresa tus credenciales para administrar tus propiedades y contactos"}
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {errorMessage}
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
                placeholder="admin@ejemplo.com"
                className="w-full rounded-md border border-neutral-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-sage-deep focus:ring-2 focus:ring-sage/20"
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
                placeholder="••••••••"
                className="w-full rounded-md border border-neutral-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-sage-deep focus:ring-2 focus:ring-sage/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-ink py-2.5 text-sm font-medium text-linen transition-colors hover:bg-sage-deep disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isRegisterMode ? "Crear cuenta" : "Entrar al panel"}
          </button>
        </form>

        <div className="flex items-center justify-between border-t border-stone pt-4 text-xs text-ink-soft">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setErrorMessage(null);
            }}
            className="text-sage-deep hover:underline"
          >
            {isRegisterMode
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿Primera vez? Crea tu usuario administrador"}
          </button>
          <Link href="/" className="hover:underline">
            Volver a la web
          </Link>
        </div>
      </div>
    </div>
  );
}
