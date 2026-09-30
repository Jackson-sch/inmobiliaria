"use client";

import { useState, useRef } from "react";
import { Video, FileText, Upload, Trash2, ExternalLink, Loader2, Play, CheckCircle2, Film } from "lucide-react";
import { toast } from "sonner";
import { deletePropertyMedia } from "@/actions/properties";

interface MediaUploaderProps {
  propertyId?: string;
  videoUrl?: string | null;
  videoPublicId?: string | null;
  pdfUrl?: string | null;
  pdfPublicId?: string | null;
  pdfName?: string | null;
  onVideoChange: (url: string | null, publicId: string | null) => void;
  onPdfChange: (url: string | null, publicId: string | null, name: string | null) => void;
}

export function MediaUploader({
  propertyId,
  videoUrl: initialVideoUrl,
  videoPublicId: initialVideoPublicId,
  pdfUrl: initialPdfUrl,
  pdfPublicId: initialPdfPublicId,
  pdfName: initialPdfName,
  onVideoChange,
  onPdfChange,
}: MediaUploaderProps) {
  // Estado local para Video
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl ?? null);
  const [videoPublicId, setVideoPublicId] = useState<string | null>(initialVideoPublicId ?? null);
  const [videoMode, setVideoMode] = useState<"file" | "url">("file");
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [youtubeInput, setYoutubeInput] = useState("");

  // Estado local para PDF
  const [pdfUrl, setPdfUrl] = useState<string | null>(initialPdfUrl ?? null);
  const [pdfPublicId, setPdfPublicId] = useState<string | null>(initialPdfPublicId ?? null);
  const [pdfName, setPdfName] = useState<string | null>(initialPdfName ?? null);
  const [pdfProgress, setPdfProgress] = useState<number | null>(null);
  const [isPdfUploading, setIsPdfUploading] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Obtiene firma de Cloudinary
  const getSignature = async () => {
    const target = propertyId || "temp";
    const res = await fetch(`/api/cloudinary/sign?propertyId=${target}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "No se pudo obtener la firma de Cloudinary. Verifica las credenciales en /admin/configuracion.");
    }
    return res.json() as Promise<{
      timestamp: number;
      signature: string;
      cloudName: string;
      apiKey: string;
      folder: string;
    }>;
  };

  // Subida de video a Cloudinary
  const handleVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Por favor selecciona un archivo de video válido (.mp4, .mov, .webm)");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error("El video supera el límite recomendado de 100 MB. Para videos muy largos recomendamos usar enlace de YouTube.");
      return;
    }

    setIsVideoUploading(true);
    setVideoProgress(1);

    try {
      const sig = await getSignature();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setVideoProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            const uploadedUrl = data.secure_url;
            const uploadedPublicId = data.public_id;
            setVideoUrl(uploadedUrl);
            setVideoPublicId(uploadedPublicId);
            onVideoChange(uploadedUrl, uploadedPublicId);
            toast.success("¡Video subido a Cloudinary exitosamente!");
            resolve();
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error?.message || "Cloudinary rechazó el video"));
            } catch {
              reject(new Error("Error al procesar el video en Cloudinary"));
            }
          }
        };

        xhr.onerror = () => reject(new Error("Error de conexión al subir video a Cloudinary"));
        xhr.send(formData);
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al subir video");
    } finally {
      setIsVideoUploading(false);
      setVideoProgress(null);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  // Asignar video por URL de YouTube/Vimeo
  const handleApplyYoutubeUrl = () => {
    if (!youtubeInput.trim()) return;
    const url = youtubeInput.trim();
    setVideoUrl(url);
    setVideoPublicId(null);
    onVideoChange(url, null);
    setYoutubeInput("");
    toast.success("Enlace de video aplicado.");
  };

  // Eliminar video
  const handleDeleteVideo = async () => {
    if (propertyId && videoPublicId) {
      await deletePropertyMedia(propertyId, "video", videoPublicId);
    }
    setVideoUrl(null);
    setVideoPublicId(null);
    onVideoChange(null, null);
    toast.info("Video removido.");
  };

  // Subida de PDF a Cloudinary
  const handlePdfFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Por favor selecciona un archivo en formato PDF");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("El PDF supera el límite de 20 MB");
      return;
    }

    setIsPdfUploading(true);
    setPdfProgress(1);

    try {
      const sig = await getSignature();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        // Usamos auto/upload para documentos PDF
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setPdfProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            const uploadedUrl = data.secure_url;
            const uploadedPublicId = data.public_id;
            const defaultName = file.name.replace(/\.pdf$/i, "");
            setPdfUrl(uploadedUrl);
            setPdfPublicId(uploadedPublicId);
            setPdfName(defaultName);
            onPdfChange(uploadedUrl, uploadedPublicId, defaultName);
            toast.success("¡Documento PDF subido a Cloudinary exitosamente!");
            resolve();
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error?.message || "Cloudinary rechazó el PDF"));
            } catch {
              reject(new Error("Error al subir el archivo PDF a Cloudinary"));
            }
          }
        };

        xhr.onerror = () => reject(new Error("Error de conexión al subir PDF a Cloudinary"));
        xhr.send(formData);
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al subir PDF");
    } finally {
      setIsPdfUploading(false);
      setPdfProgress(null);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  // Eliminar PDF
  const handleDeletePdf = async () => {
    if (propertyId && pdfPublicId) {
      await deletePropertyMedia(propertyId, "pdf", pdfPublicId);
    }
    setPdfUrl(null);
    setPdfPublicId(null);
    setPdfName(null);
    onPdfChange(null, null, null);
    toast.info("Documento PDF removido.");
  };

  // Helper para detectar si la URL es YouTube
  const isYoutube = videoUrl?.includes("youtube.com") || videoUrl?.includes("youtu.be");

  return (
    <section className="space-y-6 rounded-2xl border border-stone/80 bg-white p-6 shadow-2xs">
      <div>
        <h2 className="text-base font-semibold text-neutral-900 font-display">
          Multimedia Adicional y Documentos
        </h2>
        <p className="mt-0.5 text-xs text-neutral-500">
          Enriquece la publicación con un video recorrido y el brochure o plano en PDF (alojados en Cloudinary).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ========================================================= */}
        {/* BLOQUE VIDEO */}
        {/* ========================================================= */}
        <div className="space-y-3 rounded-xl border border-stone bg-linen/30 p-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <Film className="h-4 w-4 text-emerald-700" />
              <span>Video del Inmueble</span>
            </label>
            {!videoUrl && (
              <div className="flex rounded-lg border border-stone bg-white p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setVideoMode("file")}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                    videoMode === "file" ? "bg-sage-deep text-white" : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Subir MP4
                </button>
                <button
                  type="button"
                  onClick={() => setVideoMode("url")}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                    videoMode === "url" ? "bg-sage-deep text-white" : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  YouTube / Link
                </button>
              </div>
            )}
          </div>

          {videoUrl ? (
            <div className="space-y-3">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black border border-stone">
                {isYoutube ? (
                  <iframe
                    src={
                      videoUrl.includes("watch?v=")
                        ? videoUrl.replace("watch?v=", "embed/")
                        : videoUrl.includes("youtu.be/")
                        ? videoUrl.replace("youtu.be/", "www.youtube.com/embed/")
                        : videoUrl
                    }
                    title="Video del inmueble"
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={videoUrl}
                    controls
                    className="h-full w-full object-contain"
                  />
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Video asignado
                </span>
                <button
                  type="button"
                  onClick={handleDeleteVideo}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Eliminar video</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              {videoMode === "file" ? (
                <div>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    onChange={handleVideoFileSelect}
                    className="hidden"
                    disabled={isVideoUploading}
                  />

                  {isVideoUploading ? (
                    <div className="space-y-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-6 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-700" />
                      <p className="text-xs font-semibold text-emerald-900">
                        Subiendo video a Cloudinary... {videoProgress}%
                      </p>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-200">
                        <div
                          className="h-full bg-emerald-600 transition-all duration-300"
                          style={{ width: `${videoProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => videoInputRef.current?.click()}
                      className="cursor-pointer rounded-xl border-2 border-dashed border-stone bg-white p-6 text-center transition-colors hover:border-emerald-600 hover:bg-linen/40"
                    >
                      <Video className="mx-auto h-8 w-8 text-neutral-400" />
                      <p className="mt-2 text-xs font-medium text-neutral-700">
                        Haz clic para subir video (MP4, MOV, WebM)
                      </p>
                      <p className="mt-0.5 text-[11px] text-neutral-400">
                        Recomendado hasta 100 MB. Almacenamiento en Cloudinary.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeInput}
                    onChange={(e) => setYoutubeInput(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={handleApplyYoutubeUrl}
                    className="rounded-md bg-sage-deep px-3 py-1.5 text-xs font-medium text-white hover:bg-sage-dark transition-colors"
                  >
                    Guardar enlace
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* BLOQUE PDF (BROCHURE / PLANO) */}
        {/* ========================================================= */}
        <div className="space-y-3 rounded-xl border border-stone bg-linen/30 p-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <FileText className="h-4 w-4 text-emerald-700" />
              <span>Brochure o Plano (PDF)</span>
            </label>
          </div>

          {pdfUrl ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-stone bg-white p-3.5 shadow-2xs">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-100 font-bold text-xs">
                    PDF
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-neutral-900 truncate">
                      {pdfName || "Brochure Comercial"}
                    </p>
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline mt-0.5"
                    >
                      <span>Ver o descargar documento</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDeletePdf}
                  className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Eliminar PDF"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-neutral-600">
                  Nombre descriptivo del documento:
                </label>
                <input
                  type="text"
                  value={pdfName || ""}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setPdfName(newName);
                    onPdfChange(pdfUrl, pdfPublicId, newName);
                  }}
                  placeholder="Ej: Brochure oficial del proyecto, Plano de arquitectura"
                  className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                onChange={handlePdfFileSelect}
                className="hidden"
                disabled={isPdfUploading}
              />

              {isPdfUploading ? (
                <div className="space-y-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-6 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-700" />
                  <p className="text-xs font-semibold text-emerald-900">
                    Subiendo PDF a Cloudinary... {pdfProgress}%
                  </p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-200">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${pdfProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => pdfInputRef.current?.click()}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-stone bg-white p-6 text-center transition-colors hover:border-emerald-600 hover:bg-linen/40"
                >
                  <FileText className="mx-auto h-8 w-8 text-neutral-400" />
                  <p className="mt-2 text-xs font-medium text-neutral-700">
                    Haz clic para subir Brochure o Plano (PDF)
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    Formatos .pdf hasta 20 MB. Almacenamiento en Cloudinary.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
