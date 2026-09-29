# Plataforma Inmobiliaria — Jean Mendocilla (Trujillo, Perú)

Sitio web y plataforma inmobiliaria moderna construida con **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **Supabase (PostgreSQL & Auth)** y **Cloudinary**.

---

## 🚀 Características

- **Landing Page Editorial (`/`)**:
  - Hero asimétrico con tipografía editorial (`Fraunces` + `Inter`).
  - Vitrina de propiedades destacadas con tarjetas con diseño de lujo cálido (`linen`, `ink`, `sage`, `bronze`, `stone`).
  - Sección de presentación del asesor inmobiliario (*Jean Mendocilla*).
  - Llamados a la acción directos por WhatsApp.
- **Catálogo de Inmuebles (`/propiedades`)**:
  - Filtro por operación (Venta / Alquiler).
  - Filtro por tipo de propiedad (Casa, Departamento, Terreno, Oficina, Local Comercial).
  - Filtro por distrito dinámico según inmuebles activos en la base de datos.
  - Búsqueda por rango de precio y texto libre.
  - Paginación Server-Side.
- **Ficha de Detalle (`/propiedades/[slug]`)**:
  - Galería interactiva con vista en cuadrícula y visor lightbox fullscreen.
  - Especificaciones técnicas: dormitorios, baños, cocheras, área de terreno/construida, pisos, año.
  - Listado de amenidades.
  - Mapa integrado de Google Maps por coordenadas.
  - Formulario de contacto directo con registro de leads.
  - Botón flotante y directo de WhatsApp preconfigurado con el título del inmueble.
- **Panel Administrativo (`/admin/propiedades/nueva`)**:
  - Formulario de creación/edición de propiedades validado con **Zod** y **React Hook Form**.
  - Subida directa drag-and-drop a **Cloudinary** con firmas seguras (`/api/cloudinary/sign`).
  - Selección interactiva de foto de portada y ordenamiento.
- **Backend & Base de Datos**:
  - Esquema SQL para Supabase PostgreSQL con Row Level Security (RLS) en `supabase/schema.sql`.
  - Server Actions en Next.js con revalidación de rutas automática.

---

## 📁 Estructura del Proyecto

```text
inmobiliaria/
├── actions/
│   └── properties.ts              # Server Actions (crear, actualizar, borrar propiedad e imágenes, leads)
├── app/
│   ├── admin/
│   │   └── propiedades/nueva/    # Página de creación de propiedades (Admin)
│   ├── api/
│   │   └── cloudinary/sign/       # Endpoint de firma para subida directa a Cloudinary
│   ├── propiedades/
│   │   ├── [slug]/                # Detalle de propiedad
│   │   └── page.tsx               # Catálogo público con filtros
│   ├── globals.css                # Tailwind CSS v4 con variables de diseño editorial
│   ├── layout.tsx                 # Root layout con Google Fonts (Fraunces & Inter)
│   └── page.tsx                   # Landing Home Page
├── components/
│   ├── admin/
│   │   ├── ImageUploader.tsx      # Subida drag-and-drop a Cloudinary con progreso
│   │   └── PropertyForm.tsx       # Formulario completo con Zod & React Hook Form
│   ├── catalogo/
│   │   ├── PropertyCard.tsx       # Tarjeta de inmueble con diseño editorial
│   │   └── PropertyFiltersBar.tsx # Barra de filtros del catálogo
│   ├── detalle/
│   │   ├── ContactForm.tsx        # Formulario de lead
│   │   ├── PropertyGallery.tsx    # Galería y Lightbox
│   │   └── WhatsAppButton.tsx     # Botón normal y flotante de WhatsApp
│   └── layout/
│       ├── SiteFooter.tsx         # Pie de página
│       └── SiteHeader.tsx         # Encabezado con navegación
├── lib/
│   ├── queries/
│   │   └── properties.ts          # Consultas a Supabase
│   ├── supabase/
│   │   └── server.ts              # Clientes de Supabase (@supabase/ssr)
│   └── cloudinary.ts              # Configuración y utilidades de Cloudinary
├── public/                        # Imágenes y assets estáticos
├── supabase/
│   └── schema.sql                 # Esquema de base de datos con tablas, triggers y RLS
├── types.ts                       # Tipos TypeScript y esquemas Zod
├── next.config.ts                 # Configuración de Next.js (patrones de imágenes remotas)
└── tailwind.config.ts             # Tokens de diseño editorial
```

---

## ⚙️ Configuración y Variables de Entorno

Copia el archivo `.env.example` a `.env.local` y coloca las credenciales reales:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

---

## 📦 Ejecución

Para iniciar el servidor de desarrollo:

```bash
cd inmobiliaria
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
