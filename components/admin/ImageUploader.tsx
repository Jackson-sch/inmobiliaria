"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { GripVertical, Loader2, Star, Trash2, Upload } from "lucide-react";
import {
  addPropertyImage,
  deletePropertyImage,
  setCoverImage,
} from "@/actions/properties";
import type { CloudinaryUploadResult, PropertyImage } from "@/types";

export interface StagedImage {
  id: string;
  file: File;
  previewUrl: string;
  isCover: boolean;
}

interface ImageUploaderProps {
  propertyId?: string;
  initialImages?: PropertyImage[];
  stagedImages?: StagedImage[];
  onStagedImagesChange?: (images: StagedImage[]) => void;
}

interface PendingUpload {
  tempId: string;
  fileName: string;
  progress: number;
  error?: string;
}

export async function fetchSignature(propertyId: string) {
  const res = await fetch(`/api/cloudinary/sign?propertyId=${propertyId}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "No se pudo obtener la firma de Cloudinary. Verifica las credenciales en /admin/configuracion.");
  }
  return res.json() as Promise<{
    timestamp: number;
    signature: string;
    cloudName: string;
    apiKey: string;
    folder: string;
  }>;
}

export function uploadToCloudinary(
  file: File,
  sig: Awaited<ReturnType<typeof fetchSignature>>,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sig.apiKey);
    formData.append("timestamp", String(sig.timestamp));
    formData.append("signature", sig.signature);
    formData.append("folder", sig.folder);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`
    );

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes.error?.message || "Cloudinary rechazó la subida"));
        } catch {
          reject(new Error("Cloudinary rechazó la subida"));
        }
      }
    };
    xhr.onerror = () => reject(new Error("Error de red al subir la imagen a Cloudinary"));
    xhr.send(formData);
  });
}

export function ImageUploader({
  propertyId,
  initialImages = [],
  stagedImages = [],
  onStagedImagesChange,
}: ImageUploaderProps) {
  // Modo edición con subida inmediata a BD
  const [images, setImages] = useState<PropertyImage[]>(
    [...initialImages].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isStagedMode = !propertyId;

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      const files = Array.from(fileList).filter((f) =>
        f.type.startsWith("image/")
      );

      // MODO CREACIÓN (Previsualización local antes de crear la propiedad)
      if (isStagedMode) {
        const newStaged: StagedImage[] = files.map((file, idx) => ({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          previewUrl: URL.createObjectURL(file),
          isCover: stagedImages.length === 0 && idx === 0,
        }));

        const updated = [...stagedImages, ...newStaged];
        onStagedImagesChange?.(updated);
        return;
      }

      // MODO EDICIÓN (Subida directa a Cloudinary y vinculación en BD)
      for (const file of files) {
        const tempId = `${file.name}-${Date.now()}-${Math.random()}`;
        setPending((prev) => [
          ...prev,
          { tempId, fileName: file.name, progress: 0 },
        ]);

        try {
          const sig = await fetchSignature(propertyId);
          const uploadResult = await uploadToCloudinary(file, sig, (percent) => {
            setPending((prev) =>
              prev.map((p) => (p.tempId === tempId ? { ...p, progress: percent } : p))
            );
          });

          const isFirstImage = images.length === 0 && pending.length === 0;
          const result = await addPropertyImage({
            propertyId,
            cloudinaryPublicId: uploadResult.public_id,
            secureUrl: uploadResult.secure_url,
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format,
            isCover: isFirstImage,
            sortOrder: images.length,
          });

          if (!result.success) {
            throw new Error(result.error);
          }

          setImages((prev) => [
            ...prev,
            {
              id: result.data.id,
              propertyId,
              cloudinaryPublicId: uploadResult.public_id,
              secureUrl: uploadResult.secure_url,
              width: uploadResult.width,
              height: uploadResult.height,
              format: uploadResult.format,
              isCover: isFirstImage,
              sortOrder: images.length,
              createdAt: new Date().toISOString(),
            },
          ]);
        } catch (err) {
          setPending((prev) =>
            prev.map((p) =>
              p.tempId === tempId
                ? { ...p, error: err instanceof Error ? err.message : "Error al subir" }
                : p
            )
          );
          continue;
        }

        setPending((prev) => prev.filter((p) => p.tempId !== tempId));
      }
    },
    [propertyId, isStagedMode, stagedImages, onStagedImagesChange, images.length, pending.length]
  );

  const handleDeleteStaged = (id: string) => {
    const updated = stagedImages.filter((img) => img.id !== id);
    if (updated.length > 0 && !updated.some((img) => img.isCover)) {
      updated[0].isCover = true;
    }
    onStagedImagesChange?.(updated);
  };

  const handleSetCoverStaged = (id: string) => {
    const updated = stagedImages.map((img) => ({
      ...img,
      isCover: img.id === id,
    }));
    onStagedImagesChange?.(updated);
  };

  const handleDeleteExisting = async (imageId: string) => {
    const previous = images;
    setImages((prev) => prev.filter((img) => img.id !== imageId));
    const result = await deletePropertyImage(imageId);
    if (!result.success) {
      setImages(previous);
      alert("Error al eliminar imagen: " + result.error);
    }
  };

  const handleSetCoverExisting = async (imageId: string) => {
    setImages((prev) =>
      prev.map((img) => ({ ...img, isCover: img.id === imageId }))
    );
    if (propertyId) {
      await setCoverImage(propertyId, imageId);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files.length > 0) {
            void handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? "border-emerald-500 bg-emerald-50"
            : "border-neutral-300 bg-neutral-50 hover:border-neutral-400"
        }`}
      >
        <Upload className="h-6 w-6 text-neutral-400" />
        <p className="text-sm font-medium text-neutral-700">
          Arrastra tus fotos aquí o haz clic para seleccionarlas
        </p>
        <p className="text-xs text-neutral-400">
          {isStagedMode
            ? "Puedes seleccionar varias fotos a la vez. Se subirán al crear la propiedad."
            : "Formatos admitidos: JPG, PNG o WebP"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              void handleFiles(e.target.files);
            }
            e.target.value = "";
          }}
        />
      </div>

      {/* Progreso de subida en modo edición */}
      {pending.length > 0 && (
        <ul className="space-y-2">
          {pending.map((p) => (
            <li
              key={p.tempId}
              className="flex items-center gap-3 rounded-md border border-neutral-200 px-3 py-2 text-sm"
            >
              {p.error ? (
                <span className="text-red-600 text-xs">
                  {p.fileName}: {p.error}
                </span>
              ) : (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                  <span className="flex-1 truncate text-xs">{p.fileName}</span>
                  <span className="text-xs text-neutral-400">{p.progress}%</span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* GRID EN MODO CREACIÓN (Previsualización) */}
      {isStagedMode && stagedImages.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span>{stagedImages.length} {stagedImages.length === 1 ? "foto seleccionada" : "fotos seleccionadas"}</span>
            <span className="text-neutral-400">Haz clic en la estrella para elegir la foto de portada</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {stagedImages.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col justify-between bg-black/0 p-2 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                  <div className="flex justify-between">
                    <GripVertical className="h-4 w-4 text-white opacity-60" />
                    {item.isCover && (
                      <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-medium text-white shadow">
                        Portada
                      </span>
                    )}
                  </div>
                  <div className="flex justify-end gap-1">
                    {!item.isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCoverStaged(item.id)}
                        title="Marcar como portada"
                        className="rounded bg-white/90 p-1.5 hover:bg-white"
                      >
                        <Star className="h-3.5 w-3.5 text-neutral-700" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteStaged(item.id)}
                      title="Quitar foto"
                      className="rounded bg-white/90 p-1.5 hover:bg-white text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GRID EN MODO EDICIÓN (Fotos guardadas en BD) */}
      {!isStagedMode && images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200"
            >
              <Image
                src={image.secureUrl}
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 flex flex-col justify-between bg-black/0 p-2 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                <div className="flex justify-between">
                  <GripVertical className="h-4 w-4 text-white opacity-60" />
                  {image.isCover && (
                    <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-medium text-white shadow">
                      Portada
                    </span>
                  )}
                </div>
                <div className="flex justify-end gap-1">
                  {!image.isCover && (
                    <button
                      type="button"
                      onClick={() => handleSetCoverExisting(image.id)}
                      title="Usar como portada"
                      className="rounded bg-white/90 p-1.5 hover:bg-white"
                    >
                      <Star className="h-3.5 w-3.5 text-neutral-700" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteExisting(image.id)}
                    title="Eliminar imagen"
                    className="rounded bg-white/90 p-1.5 hover:bg-white"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
