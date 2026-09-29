"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, ImageIcon, RotateCcw, Loader2, AlertCircle } from "lucide-react";

interface ProfilePhotoUploaderProps {
  photoUrl: string;
  agentName: string;
  onPhotoChange: (url: string) => void;
  disabled?: boolean;
}

export function ProfilePhotoUploader({
  photoUrl,
  agentName,
  onPhotoChange,
  disabled = false,
}: ProfilePhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPhoto = photoUrl || "/jean-mendocilla-exterior.jpg";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("La imagen no debe superar los 10MB de tamaño.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const sigRes = await fetch("/api/cloudinary/sign?folder=inmobiliaria/agent");
      if (!sigRes.ok) {
        const errorJson = await sigRes.json().catch(() => ({}));
        throw new Error(
          errorJson.error ||
            "No se pudo obtener la firma de Cloudinary. Verifica que las credenciales de Cloudinary estén configuradas abajo."
        );
      }

      const sig = (await sigRes.json()) as {
        timestamp: number;
        signature: string;
        cloudName: string;
        apiKey: string;
        folder: string;
      };

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);

      const secureUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`
        );

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve(res.secure_url);
            } catch {
              reject(new Error("Respuesta inválida de Cloudinary"));
            }
          } else {
            try {
              const errRes = JSON.parse(xhr.responseText);
              reject(new Error(errRes.error?.message || "Error al subir a Cloudinary"));
            } catch {
              reject(new Error(`Error al subir a Cloudinary (HTTP ${xhr.status})`));
            }
          }
        };

        xhr.onerror = () => {
          reject(new Error("Error de conexión al subir la imagen a Cloudinary"));
        };

        xhr.send(formData);
      });

      onPhotoChange(secureUrl);
    } catch (err: any) {
      setUploadError(err.message || "Error al subir la imagen a Cloudinary.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleResetPhoto = () => {
    onPhotoChange("/jean-mendocilla-exterior.jpg");
  };

  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-sage-deep mb-3 flex items-center gap-1.5">
        <ImageIcon className="h-3.5 w-3.5" />
        Fotografía del Asesor (Sección &ldquo;Sobre mí&rdquo; y Perfil)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start rounded-xl border border-stone/80 bg-linen/30 p-5">
        {/* Previsualización en formato 3:4 (igual que en la home) */}
        <div className="md:col-span-4 flex flex-col items-center">
          <div className="relative aspect-[3/4] w-44 overflow-hidden rounded-xl border-2 border-stone bg-stone shadow-md">
            <Image
              src={currentPhoto}
              alt={agentName || "Foto del Asesor"}
              fill
              sizes="176px"
              className="object-cover"
            />
          </div>
          <span className="mt-2 text-[11px] font-medium text-sage-deep">
            Vista previa en web (3:4 vertical)
          </span>
        </div>

        {/* Controles de Subida */}
        <div className="md:col-span-8 space-y-4">
          <div>
            <p className="text-xs font-semibold text-ink">
              Subir nueva foto a Cloudinary
            </p>
            <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
              Esta fotografía se mostrará en tamaño destacado junto a tu biografía en la sección &ldquo;Sobre mí&rdquo; de la página principal y en el avatar de las fichas de propiedades.
            </p>
          </div>

          {/* Input oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading || disabled}
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || disabled}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-emerald-800 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Subiendo a Cloudinary ({uploadProgress}%)...
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Seleccionar y subir foto
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetPhoto}
              disabled={isUploading || disabled}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone px-3 py-2 text-xs font-medium text-neutral-600 transition hover:bg-white hover:text-ink disabled:opacity-50"
            >
              <RotateCcw className="h-3 w-3" />
              Restaurar foto original
            </button>
          </div>

          {/* Barra de progreso */}
          {isUploading && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-neutral-600 font-mono">
                <span>Cargando en Cloudinary...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full bg-emerald-600 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error de subida */}
          {uploadError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Input URL directo */}
          <div className="pt-2">
            <label className="block text-[11px] font-medium text-neutral-500 mb-1">
              URL directa de la imagen (Cloudinary o externa):
            </label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => onPhotoChange(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs text-ink font-mono outline-none focus:border-sage-deep"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
