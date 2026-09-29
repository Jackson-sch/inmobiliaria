"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut, ExternalLink, Plus } from "lucide-react";
import { logout } from "@/actions/auth";

export function AdminHeader({ userEmail }: { userEmail?: string }) {
  return (
    <header className="border-b border-stone bg-white sticky top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="font-display text-xl text-ink font-semibold">
            Panel Inmobiliario
          </Link>
          <div className="hidden sm:flex items-center gap-2 bg-linen py-1 pl-1.5 pr-3 rounded-full border border-stone/60 shadow-xs">
            <div className="relative h-6 w-6 rounded-full overflow-hidden bg-stone flex-shrink-0">
              <Image src="/jean-mendocilla.jpg" alt="Jean Mendocilla" fill className="object-cover" sizes="24px" />
            </div>
            <span className="text-xs text-sage-deep font-medium">Jean Mendocilla</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/propiedades/nueva"
            className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium text-linen hover:bg-sage-deep transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Nueva Propiedad
          </Link>

          <Link
            href="/admin/configuracion"
            title="Configuración de Cloudinary"
            className="flex items-center gap-1 text-xs text-ink-soft hover:text-ink px-2 py-1 rounded hover:bg-linen"
          >
            Configuración
          </Link>

          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1 text-xs text-ink-soft hover:text-ink px-2 py-1"
          >
            Ver web
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          {userEmail && (
            <span className="hidden md:inline-block text-xs text-neutral-400">
              {userEmail}
            </span>
          )}

          <button
            type="button"
            onClick={() => logout()}
            title="Cerrar sesión"
            className="flex items-center gap-1 rounded-md border border-stone px-2.5 py-1.5 text-xs text-neutral-600 hover:bg-linen"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
