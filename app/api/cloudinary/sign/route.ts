import { NextRequest, NextResponse } from "next/server";
import { getSignedUploadParams } from "@/lib/cloudinary";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/cloudinary/sign?propertyId=<uuid>
 *
 * Devuelve los parámetros firmados que el cliente necesita para subir
 * directamente a Cloudinary (sin pasar el archivo por nuestro servidor).
 * Requiere sesión autenticada: solo el panel admin puede pedir firmas.
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const propertyId = request.nextUrl.searchParams.get("propertyId");
  if (!propertyId) {
    return NextResponse.json(
      { error: "propertyId es requerido" },
      { status: 400 }
    );
  }

  try {
    const params = await getSignedUploadParams(propertyId);
    return NextResponse.json(params);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
