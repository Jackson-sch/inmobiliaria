"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { createProperty, updateProperty, addPropertyImage } from "@/actions/properties";
import {
  propertyFormSchema,
  PropertyType,
  OperationType,
  PropertyStatus,
  type PropertyFormInput,
  type PropertyFormValues,
  type Amenity,
  type Property,
} from "@/types";
import { ImageUploader, type StagedImage, fetchSignature, uploadToCloudinary } from "./ImageUploader";

interface PropertyFormProps {
  agentId: string;
  amenities: Amenity[];
  /** Si se pasa, el formulario opera en modo edición. */
  property?: Property;
}

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.CASA]: "Casa",
  [PropertyType.DEPARTAMENTO]: "Departamento",
  [PropertyType.TERRENO]: "Terreno",
  [PropertyType.OFICINA]: "Oficina",
  [PropertyType.LOCAL_COMERCIAL]: "Local comercial",
};

const OPERATION_LABELS: Record<OperationType, string> = {
  [OperationType.VENTA]: "Venta",
  [OperationType.ALQUILER]: "Alquiler",
};

const STATUS_LABELS: Record<PropertyStatus, string> = {
  [PropertyStatus.DISPONIBLE]: "Disponible",
  [PropertyStatus.RESERVADO]: "Reservado",
  [PropertyStatus.VENDIDO]: "Vendido",
  [PropertyStatus.INACTIVO]: "Inactivo",
};

function inputClass(hasError: boolean) {
  return `w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-emerald-500/40 ${
    hasError ? "border-red-400" : "border-neutral-300 focus:border-emerald-500"
  }`;
}

export function PropertyForm({ agentId, amenities, property }: PropertyFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const isEditing = Boolean(property);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormInput, any, PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: property
      ? {
          title: property.title,
          description: property.description,
          type: property.type,
          operation: property.operation,
          status: property.status,
          price: property.price,
          currency: property.currency,
          address: property.address ?? undefined,
          district: property.district,
          city: property.city,
          latitude: property.latitude ?? undefined,
          longitude: property.longitude ?? undefined,
          landAreaM2: property.landAreaM2 ?? undefined,
          builtAreaM2: property.builtAreaM2 ?? undefined,
          bedrooms: property.bedrooms ?? undefined,
          bathrooms: property.bathrooms ?? undefined,
          parkingSpots: property.parkingSpots,
          floors: property.floors ?? undefined,
          yearBuilt: property.yearBuilt ?? undefined,
          featured: property.featured,
          amenityIds: property.amenities?.map((a) => a.id) ?? [],
        }
      : {
          currency: "PEN",
          city: "Trujillo",
          operation: OperationType.VENTA,
          status: PropertyStatus.DISPONIBLE,
          parkingSpots: 0,
          featured: false,
          amenityIds: [],
        },
  });

  const onSubmit = async (values: PropertyFormValues) => {
    setServerError(null);

    const result = isEditing
      ? await updateProperty(property!.id, values)
      : await createProperty(agentId, values);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    // Si estamos en creación y hay fotos seleccionadas, subirlas a Cloudinary
    if (!isEditing && stagedImages.length > 0) {
      const propertyId = result.data.id;
      for (let i = 0; i < stagedImages.length; i++) {
        const item = stagedImages[i];
        setUploadProgress(`Subiendo foto ${i + 1} de ${stagedImages.length} a Cloudinary...`);
        try {
          const sig = await fetchSignature(propertyId);
          const uploadRes = await uploadToCloudinary(item.file, sig);
          await addPropertyImage({
            propertyId,
            cloudinaryPublicId: uploadRes.public_id,
            secureUrl: uploadRes.secure_url,
            width: uploadRes.width,
            height: uploadRes.height,
            format: uploadRes.format,
            isCover: item.isCover,
            sortOrder: i,
          });
        } catch (err: any) {
          console.error("Error al subir foto:", err);
          alert(`La propiedad se creó, pero la foto ${item.file.name} no se pudo subir: ${err.message}`);
        }
      }
      setUploadProgress(null);
    }

    router.push(`/admin/propiedades/${result.data.slug}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-8">
      {serverError && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Datos principales */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900">Datos principales</h2>

        <div>
          <label className="mb-1 block text-sm text-neutral-700">Título</label>
          <input
            {...register("title")}
            className={inputClass(!!errors.title)}
            placeholder="Casa de 3 dormitorios en Urb. California"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-700">Descripción</label>
          <textarea
            {...register("description")}
            rows={5}
            className={inputClass(!!errors.description)}
            placeholder="Describe la propiedad: ambientes, acabados, ubicación, puntos cercanos..."
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm text-neutral-700">Tipo</label>
            <select {...register("type")} className={inputClass(!!errors.type)}>
              <option value="">Selecciona...</option>
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-neutral-700">Operación</label>
            <select {...register("operation")} className={inputClass(!!errors.operation)}>
              {Object.entries(OPERATION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-neutral-700">Estado</label>
            <select {...register("status")} className={inputClass(!!errors.status)}>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Precio */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900">Precio</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm text-neutral-700">Precio</label>
            <input
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              className={inputClass(!!errors.price)}
            />
            {errors.price && (
              <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-700">Moneda</label>
            <select {...register("currency")} className={inputClass(false)}>
              <option value="PEN">Soles (PEN)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Ubicación */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900">Ubicación</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-neutral-700">Distrito</label>
            <input {...register("district")} className={inputClass(!!errors.district)} />
            {errors.district && (
              <p className="mt-1 text-xs text-red-600">{errors.district.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-700">Ciudad</label>
            <input {...register("city")} className={inputClass(false)} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-neutral-700">Dirección</label>
            <input {...register("address")} className={inputClass(false)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-700">Latitud</label>
            <input
              type="number"
              step="any"
              {...register("latitude", { valueAsNumber: true })}
              className={inputClass(false)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-700">Longitud</label>
            <input
              type="number"
              step="any"
              {...register("longitude", { valueAsNumber: true })}
              className={inputClass(false)}
            />
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900">Características</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-700">Área terreno (m²)</label>
            <input
              type="number"
              step="0.01"
              {...register("landAreaM2", { valueAsNumber: true })}
              className={inputClass(false)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-700">Área construida (m²)</label>
            <input
              type="number"
              step="0.01"
              {...register("builtAreaM2", { valueAsNumber: true })}
              className={inputClass(false)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-700">Dormitorios</label>
            <input
              type="number"
              {...register("bedrooms", { valueAsNumber: true })}
              className={inputClass(false)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-700">Baños</label>
            <input
              type="number"
              {...register("bathrooms", { valueAsNumber: true })}
              className={inputClass(false)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-700">Cocheras</label>
            <input
              type="number"
              {...register("parkingSpots", { valueAsNumber: true })}
              className={inputClass(false)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-700">Pisos</label>
            <input
              type="number"
              {...register("floors", { valueAsNumber: true })}
              className={inputClass(false)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-700">Año de construcción</label>
            <input
              type="number"
              {...register("yearBuilt", { valueAsNumber: true })}
              className={inputClass(false)}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" {...register("featured")} className="h-4 w-4 rounded" />
          Destacar en la página de inicio
        </label>
      </section>

      {/* Amenidades */}
      {amenities.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-neutral-900">Amenidades</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {amenities.map((amenity) => (
              <label key={amenity.id} className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  value={amenity.id}
                  {...register("amenityIds")}
                  className="h-4 w-4 rounded"
                />
                {amenity.name}
              </label>
            ))}
          </div>
        </section>
      )}

      {/* Fotos: disponible tanto en creación como en edición */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Fotos de la Propiedad</h2>
          <p className="text-xs text-neutral-500">
            {isEditing
              ? "Sube nuevas fotos o cambia la foto de portada."
              : "Selecciona las fotos para esta nueva propiedad. Se subirán automáticamente a Cloudinary al presionar 'Crear propiedad'."}
          </p>
        </div>
        <ImageUploader
          propertyId={property?.id}
          initialImages={property?.images ?? []}
          stagedImages={stagedImages}
          onStagedImagesChange={setStagedImages}
        />
      </section>

      <div className="flex justify-end gap-3 border-t border-neutral-200 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || Boolean(uploadProgress)}
          className="flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
        >
          {(isSubmitting || uploadProgress) && <Loader2 className="h-4 w-4 animate-spin" />}
          {uploadProgress
            ? uploadProgress
            : isEditing
            ? "Guardar cambios"
            : "Crear propiedad"}
        </button>
      </div>
    </form>
  );
}
