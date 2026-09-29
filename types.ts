import { z } from "zod";

// ============================================================
// Enums (deben coincidir 1:1 con los del schema.sql)
// ============================================================
export const PropertyType = {
  CASA: "casa",
  DEPARTAMENTO: "departamento",
  TERRENO: "terreno",
  OFICINA: "oficina",
  LOCAL_COMERCIAL: "local_comercial",
} as const;
export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];

export const OperationType = {
  VENTA: "venta",
  ALQUILER: "alquiler",
} as const;
export type OperationType = (typeof OperationType)[keyof typeof OperationType];

export const PropertyStatus = {
  DISPONIBLE: "disponible",
  RESERVADO: "reservado",
  VENDIDO: "vendido",
  INACTIVO: "inactivo",
} as const;
export type PropertyStatus = (typeof PropertyStatus)[keyof typeof PropertyStatus];

export const LeadStatus = {
  NUEVO: "nuevo",
  CONTACTADO: "contactado",
  EN_NEGOCIACION: "en_negociacion",
  CERRADO: "cerrado",
  DESCARTADO: "descartado",
} as const;
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

// ============================================================
// Entidades
// ============================================================
export interface Agent {
  id: string;
  fullName: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  bio: string | null;
  avatarUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  cloudinaryPublicId: string;
  secureUrl: string;
  width: number | null;
  height: number | null;
  format: string | null;
  isCover: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string | null;
}

export interface Property {
  id: string;
  agentId: string;
  title: string;
  slug: string;
  description: string;
  type: PropertyType;
  operation: OperationType;
  status: PropertyStatus;
  price: number;
  currency: "PEN" | "USD";
  address: string | null;
  district: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  landAreaM2: number | null;
  builtAreaM2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parkingSpots: number;
  floors: number | null;
  yearBuilt: number | null;
  featured: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  // Relaciones opcionales (join)
  images?: PropertyImage[];
  amenities?: Amenity[];
  agent?: Agent;
}

export interface Lead {
  id: string;
  propertyId: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: "web" | "whatsapp" | "facebook";
  status: LeadStatus;
  createdAt: string;
}

// ============================================================
// Filtros de búsqueda del catálogo
// ============================================================
export interface PropertyFilters {
  type?: PropertyType;
  operation?: OperationType;
  district?: string;
  currency?: "USD" | "PEN";
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  areaMin?: number;
  featured?: boolean;
  query?: string; // búsqueda por texto libre (título/descripción/urbanización)
  page?: number;
  pageSize?: number;
}

// ============================================================
// Validación con Zod (para Server Actions / formularios)
// ============================================================
export const propertyFormSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(20, "La descripción es muy corta"),
  type: z.nativeEnum(PropertyType),
  operation: z.nativeEnum(OperationType),
  status: z.nativeEnum(PropertyStatus).default(PropertyStatus.DISPONIBLE),
  price: z.number().positive("El precio debe ser mayor a 0"),
  currency: z.enum(["PEN", "USD"]).default("PEN"),
  address: z.string().optional(),
  district: z.string().min(2, "Ingresa el distrito"),
  city: z.string().default("Trujillo"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  landAreaM2: z.number().positive().optional(),
  builtAreaM2: z.number().positive().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  parkingSpots: z.number().int().min(0).default(0),
  floors: z.number().int().min(0).optional(),
  yearBuilt: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  featured: z.boolean().default(false),
  amenityIds: z.array(z.string().uuid()).optional(),
});
export type PropertyFormInput = z.input<typeof propertyFormSchema>;
export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export const leadFormSchema = z.object({
  propertyId: z.string().uuid().optional(),
  name: z.string().min(2, "Ingresa tu nombre"),
  phone: z.string().min(9, "Ingresa un teléfono válido"),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().optional(),
  source: z.enum(["web", "whatsapp", "facebook"]).default("web"),
});
export type LeadFormInput = z.input<typeof leadFormSchema>;
export type LeadFormValues = z.infer<typeof leadFormSchema>;

// ============================================================
// Cloudinary — tipos de respuesta de subida
// ============================================================
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Payload que se guarda en `property_images` tras una subida exitosa a Cloudinary.
 * `sortOrder` e `isCover` se asignan en el cliente/servidor según el orden elegido.
 */
export interface NewPropertyImageInput {
  propertyId: string;
  cloudinaryPublicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  isCover: boolean;
  sortOrder: number;
}

export function toPropertyImageInput(
  propertyId: string,
  upload: CloudinaryUploadResult,
  sortOrder: number,
  isCover = false
): NewPropertyImageInput {
  return {
    propertyId,
    cloudinaryPublicId: upload.public_id,
    secureUrl: upload.secure_url,
    width: upload.width,
    height: upload.height,
    format: upload.format,
    isCover,
    sortOrder,
  };
}
