"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Star, Trash2, Upload } from "lucide-react";
import {
  addPropertyImage,
  deletePropertyImage,
  deleteUploadedImage,
  setCoverImage,
} from "@/actions/properties";
import type { CloudinaryUploadResult, InitialPropertyImageInput, PropertyImage } from "@/types";
import { toast } from "sonner";

export interface StagedImage {
  id: string;
  file: File;
  previewUrl: string;
  isCover: boolean;
}

export interface UploadItem {
  id: string; // temp ID o ID de base de datos
  previewUrl: string;
  file?: File;
  cloudinaryPublicId?: string;
  secureUrl?: string;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  isCover: boolean;
  sortOrder: number;
  status: "uploading" | "completed" | "error";
  progress: number;
  error?: string;
}

interface ImageUploaderProps {
  propertyId: string;
  isNewProperty?: boolean;
  initialImages?: PropertyImage[];
  onImagesChange?: (images: InitialPropertyImageInput[]) => void;
  onUploadingChange?: (isUploading: boolean, pendingCount: number) => void;
  // Compatibilidad hacia atrás
  stagedImages?: StagedImage[];
  onStagedImagesChange?: (images: StagedImage[]) => void;
}

export async function fetchSignature(propertyId: string) {
  const res = await fetch(`/api/cloudinary/sign?propertyId=${propertyId}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
        "No se pudo obtener la firma de Cloudinary. Verifica las credenciales en /admin/configuracion."
    );
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
  onProgress?: (percent: number) => void,
  onXhrCreated?: (xhr: XMLHttpRequest) => void
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sig.apiKey);
    formData.append("timestamp", String(sig.timestamp));
    formData.append("signature", sig.signature);
    formData.append("folder", sig.folder);

    const xhr = new XMLHttpRequest();
    onXhrCreated?.(xhr);

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
    xhr.onerror = () => reject(new Error("Error de red al subir la imagen"));
    xhr.onabort = () => reject(new Error("Subida cancelada"));
    xhr.send(formData);
  });
}

export function ImageUploader({
  propertyId,
  isNewProperty = false,
  initialImages = [],
  onImagesChange,
  onUploadingChange,
}: ImageUploaderProps) {
  const [items, setItems] = useState<UploadItem[]>(() =>
    [...initialImages]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => ({
        id: img.id,
        previewUrl: img.secureUrl,
        cloudinaryPublicId: img.cloudinaryPublicId,
        secureUrl: img.secureUrl,
        width: img.width,
        height: img.height,
        format: img.format,
        isCover: img.isCover,
        sortOrder: img.sortOrder,
        status: "completed",
        progress: 100,
      }))
  );

  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const xhrMap = useRef<Map<string, XMLHttpRequest>>(new Map());

  // Mantener referencias actualizadas para evitar loops en useEffect
  const onImagesChangeRef = useRef(onImagesChange);
  onImagesChangeRef.current = onImagesChange;

  const onUploadingChangeRef = useRef(onUploadingChange);
  onUploadingChangeRef.current = onUploadingChange;

  // Notificar al componente padre sobre cambios en estado de subida e imágenes completadas
  useEffect(() => {
    const uploadingCount = items.filter((it) => it.status === "uploading").length;
    onUploadingChangeRef.current?.(uploadingCount > 0, uploadingCount);

    if (isNewProperty) {
      const completed: InitialPropertyImageInput[] = items
        .filter(
          (it) => it.status === "completed" && Boolean(it.cloudinaryPublicId && it.secureUrl)
        )
        .map((it, idx) => ({
          cloudinaryPublicId: it.cloudinaryPublicId!,
          secureUrl: it.secureUrl!,
          width: it.width ?? null,
          height: it.height ?? null,
          format: it.format ?? null,
          isCover: it.isCover,
          sortOrder: idx,
        }));
      onImagesChangeRef.current?.(completed);
    }
  }, [items, isNewProperty]);

  // Limpiar peticiones pendientes en desmontaje
  useEffect(() => {
    const currentXhrs = xhrMap.current;
    return () => {
      currentXhrs.forEach((xhr) => xhr.abort());
      currentXhrs.clear();
    };
  }, []);

  const uploadFile = useCallback(
    async (item: UploadItem, file: File) => {
      try {
        const sig = await fetchSignature(propertyId);
        const res = await uploadToCloudinary(
          file,
          sig,
          (percent) => {
            setItems((prev) =>
              prev.map((it) =>
                it.id === item.id ? { ...it, progress: percent } : it
              )
            );
          },
          (xhr) => {
            xhrMap.current.set(item.id, xhr);
          }
        );

        xhrMap.current.delete(item.id);

        if (isNewProperty) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? {
                    ...it,
                    cloudinaryPublicId: res.public_id,
                    secureUrl: res.secure_url,
                    width: res.width,
                    height: res.height,
                    format: res.format,
                    status: "completed",
                    progress: 100,
                  }
                : it
            )
          );
        } else {
          // Modo edición: persistir de inmediato en la base de datos
          const dbResult = await addPropertyImage({
            propertyId,
            cloudinaryPublicId: res.public_id,
            secureUrl: res.secure_url,
            width: res.width,
            height: res.height,
            format: res.format,
            isCover: item.isCover,
            sortOrder: item.sortOrder,
          });

          if (!dbResult.success) {
            throw new Error(dbResult.error);
          }

          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? {
                    ...it,
                    id: dbResult.data.id,
                    cloudinaryPublicId: res.public_id,
                    secureUrl: res.secure_url,
                    width: res.width,
                    height: res.height,
                    format: res.format,
                    status: "completed",
                    progress: 100,
                  }
                : it
            )
          );
        }
      } catch (err: any) {
        xhrMap.current.delete(item.id);
        if (err.message === "Subida cancelada") return;
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: "error",
                  error: err.message || "Error al subir imagen",
                }
              : it
          )
        );
      }
    },
    [propertyId, isNewProperty]
  );

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const files = Array.from(fileList).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length === 0) return;

      setItems((prev) => {
        const hasCover = prev.some((it) => it.isCover);
        const newItems: UploadItem[] = files.map((file, idx) => {
          const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          const isCover = !hasCover && idx === 0;
          return {
            id: tempId,
            file,
            previewUrl: URL.createObjectURL(file),
            isCover,
            sortOrder: prev.length + idx,
            status: "uploading",
            progress: 0,
          };
        });

        // Iniciar subida inmediata para cada archivo en segundo plano
        setTimeout(() => {
          newItems.forEach((newItem) => {
            if (newItem.file) {
              void uploadFile(newItem, newItem.file);
            }
          });
        }, 0);

        return [...prev, ...newItems];
      });
    },
    [uploadFile]
  );

  const handleDelete = async (item: UploadItem) => {
    // Si aún se está subiendo, abortar la petición HTTP
    if (item.status === "uploading") {
      const xhr = xhrMap.current.get(item.id);
      if (xhr) {
        xhr.abort();
        xhrMap.current.delete(item.id);
      }
    }

    // Actualizar estado local
    setItems((prev) => {
      const remaining = prev.filter((it) => it.id !== item.id);
      // Si la foto eliminada era portada, asignar portada a la primera restante
      if (item.isCover && remaining.length > 0) {
        remaining[0] = { ...remaining[0], isCover: true };
        if (!isNewProperty && remaining[0].status === "completed") {
          void setCoverImage(propertyId, remaining[0].id);
        }
      }
      return remaining;
    });

    // Si ya estaba completada en Cloudinary/BD, limpiar recurso
    if (item.status === "completed") {
      if (!isNewProperty) {
        const res = await deletePropertyImage(item.id);
        if (!res.success) {
          toast.error("Error al eliminar imagen: " + res.error);
        }
      } else if (item.cloudinaryPublicId) {
        await deleteUploadedImage(item.cloudinaryPublicId);
      }
    }
  };

  const handleSetCover = async (id: string) => {
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        isCover: it.id === id,
      }))
    );

    if (!isNewProperty) {
      const target = items.find((it) => it.id === id);
      if (target && target.status === "completed") {
        await setCoverImage(propertyId, target.id);
      }
    }
  };

  const handleRetry = (item: UploadItem) => {
    if (!item.file) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === item.id
          ? { ...it, status: "uploading", progress: 0, error: undefined }
          : it
      )
    );
    void uploadFile(item, item.file);
  };

  return (
    <div className="space-y-4">
      {/* Zona de Dropzone */}
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
            handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? "border-emerald-500 bg-emerald-50/80 scale-[1.005]"
            : "border-neutral-300 bg-neutral-50/60 hover:border-neutral-400 hover:bg-neutral-50"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-2xs border border-neutral-200 text-neutral-500">
          <Upload className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-800">
            Arrastra tus fotos aquí o haz clic para seleccionarlas
          </p>
          <p className="mt-0.5 text-xs text-neutral-500">
            Se subirán de inmediato mostrando la barra de progreso individual. Formatos: JPG, PNG o WebP.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
            }
            e.target.value = "";
          }}
        />
      </div>

      {/* Grid de fotos con barra de progreso individual */}
      {items.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-neutral-600 px-0.5">
            <span className="font-medium">
              {items.length} {items.length === 1 ? "foto" : "fotos"} en total
            </span>
            <span className="text-neutral-400">
              Usa la estrella (★) para definir la foto de portada principal
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900 shadow-2xs"
              >
                {/* Previsualización de imagen */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt="Foto"
                  className="h-full w-full object-cover select-none transition-transform duration-300 group-hover:scale-105"
                />

                {/* Badge de Portada */}
                {item.isCover && (
                  <span className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow-md backdrop-blur-xs">
                    <Star className="h-3 w-3 fill-white" />
                    Portada
                  </span>
                )}

                {/* Overlay de Subida en Progreso */}
                {item.status === "uploading" && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 p-3 text-white backdrop-blur-[2px]">
                    <Loader2 className="mb-2 h-6 w-6 animate-spin text-emerald-400" />
                    <div className="w-full max-w-[85%] rounded-full bg-white/20 h-2 overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-150"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <div className="mt-2 flex w-full max-w-[85%] items-center justify-between text-[11px] font-semibold text-white/90">
                      <span>Subiendo...</span>
                      <span>{item.progress}%</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDelete(item)}
                      className="mt-2 text-[10px] text-white/70 hover:text-white underline hover:no-underline transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}

                {/* Overlay de Error */}
                {item.status === "error" && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-950/85 p-2.5 text-center text-white backdrop-blur-[2px]">
                    <p className="mb-2.5 line-clamp-2 text-[11px] font-medium text-red-200">
                      {item.error || "Error al subir"}
                    </p>
                    <div className="flex gap-1.5">
                      {item.file && (
                        <button
                          type="button"
                          onClick={() => handleRetry(item)}
                          className="rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-neutral-800 shadow hover:bg-white transition-colors"
                        >
                          Reintentar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleDelete(item)}
                        className="rounded-md bg-red-600/90 px-2.5 py-1 text-[11px] font-medium text-white shadow hover:bg-red-600 transition-colors"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                )}

                {/* Overlay de Acciones (Hover cuando está completada) */}
                {item.status === "completed" && (
                  <div className="absolute inset-0 z-10 flex flex-col justify-between bg-black/40 p-2.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex justify-end gap-1.5">
                      {!item.isCover && (
                        <button
                          type="button"
                          onClick={() => void handleSetCover(item.id)}
                          title="Establecer como foto de portada"
                          className="rounded-md bg-white/90 p-1.5 text-neutral-700 shadow hover:bg-white hover:text-amber-500 transition-colors"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleDelete(item)}
                        title="Eliminar foto"
                        className="rounded-md bg-white/90 p-1.5 text-red-600 shadow hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
