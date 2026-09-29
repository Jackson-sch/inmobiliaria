import { v2 as cloudinary } from "cloudinary";
import { createSupabaseAdminClient, createSupabaseServerClient } from "./supabase/server";

export const CLOUDINARY_UPLOAD_FOLDER = "inmobiliaria/properties";

export interface SignedUploadParams {
  timestamp: number;
  signature: string;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export interface CloudinaryCredentials {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * Obtiene las credenciales de Cloudinary priorizando la base de datos (system_settings)
 * y cayendo en las variables de entorno si aún no se han configurado en la DB.
 */
export async function getEffectiveCloudinaryConfig(): Promise<CloudinaryCredentials> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", ["cloudinary_cloud_name", "cloudinary_api_key", "cloudinary_api_secret"]);

    const map: Record<string, string> = {};
    data?.forEach((row) => {
      map[row.key] = row.value;
    });

    const cloudName = map["cloudinary_cloud_name"] || process.env.CLOUDINARY_CLOUD_NAME || "";
    const apiKey = map["cloudinary_api_key"] || process.env.CLOUDINARY_API_KEY || "";
    const apiSecret = map["cloudinary_api_secret"] || process.env.CLOUDINARY_API_SECRET || "";

    return { cloudName, apiKey, apiSecret };
  } catch {
    return {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
      apiKey: process.env.CLOUDINARY_API_KEY || "",
      apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    };
  }
}

/**
 * Aplica la configuración en la librería oficial de Cloudinary.
 */
export async function applyCloudinaryConfig(): Promise<CloudinaryCredentials> {
  const creds = await getEffectiveCloudinaryConfig();
  cloudinary.config({
    cloud_name: creds.cloudName,
    api_key: creds.apiKey,
    api_secret: creds.apiSecret,
    secure: true,
  });
  return creds;
}

/**
 * Genera la firma para subida directa desde el cliente sin exponer el api_secret.
 */
export async function getSignedUploadParams(
  targetIdOrFolder: string,
  isFolder = false
): Promise<SignedUploadParams> {
  const creds = await applyCloudinaryConfig();

  if (!creds.cloudName || !creds.apiKey || !creds.apiSecret) {
    throw new Error(
      "Cloudinary no está configurado. Configúralo en el panel de administración (/admin/configuracion)."
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = isFolder
    ? targetIdOrFolder
    : `${CLOUDINARY_UPLOAD_FOLDER}/${targetIdOrFolder}`;

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    creds.apiSecret
  );

  return {
    timestamp,
    signature,
    cloudName: creds.cloudName,
    apiKey: creds.apiKey,
    folder,
  };
}

/**
 * Elimina una imagen de Cloudinary por su public_id.
 */
export async function deleteCloudinaryImage(publicId: string): Promise<void> {
  await applyCloudinaryConfig();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

/**
 * Elimina todas las imágenes de una propiedad de un solo golpe.
 */
export async function deleteCloudinaryFolder(propertyId: string): Promise<void> {
  await applyCloudinaryConfig();
  const folder = `${CLOUDINARY_UPLOAD_FOLDER}/${propertyId}`;
  await cloudinary.api.delete_resources_by_prefix(folder);
  await cloudinary.api.delete_folder(folder).catch(() => {
    // La carpeta puede no eliminarse si Cloudinary aún no sincroniza; no es crítico.
  });
}
