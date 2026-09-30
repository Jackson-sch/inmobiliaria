-- ============================================================
-- Esquema: Plataforma inmobiliaria (Supabase / PostgreSQL)
-- Incluye: propiedades, imágenes (Cloudinary), amenidades, leads
-- ============================================================

-- Extensión para UUID
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
create type property_type as enum ('casa', 'departamento', 'terreno', 'oficina', 'local_comercial');
create type operation_type as enum ('venta', 'alquiler');
create type property_status as enum ('disponible', 'reservado', 'vendido', 'inactivo');
create type lead_status as enum ('nuevo', 'contactado', 'en_negociacion', 'cerrado', 'descartado');

-- ------------------------------------------------------------
-- AGENTES (por si en el futuro hay más de uno)
-- ------------------------------------------------------------
create table agents (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  whatsapp text,
  email text,
  bio text,
  avatar_url text,
  facebook_url text,
  instagram_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PROPIEDADES
-- ------------------------------------------------------------
create table properties (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete restrict,

  title text not null,
  slug text not null unique,
  description text not null,

  type property_type not null,
  operation operation_type not null default 'venta',
  status property_status not null default 'disponible',

  price numeric(12, 2) not null,
  currency text not null default 'PEN', -- 'PEN' | 'USD'

  -- Ubicación
  address text,
  district text not null,
  city text not null default 'Trujillo',
  latitude double precision,
  longitude double precision,

  -- Dimensiones y características
  land_area_m2 numeric(10, 2),        -- área de terreno
  built_area_m2 numeric(10, 2),       -- área construida (null en terrenos)
  bedrooms smallint,
  bathrooms smallint,
  parking_spots smallint default 0,
  floors smallint,
  year_built smallint,

  featured boolean not null default false,
  views_count integer not null default 0,

  -- Multimedia adicional y Documentos (Cloudinary / Enlaces)
  video_url text,
  video_public_id text,
  pdf_url text,
  pdf_public_id text,
  pdf_name text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_properties_type on properties(type);
create index idx_properties_operation on properties(operation);
create index idx_properties_status on properties(status);
create index idx_properties_district on properties(district);
create index idx_properties_price on properties(price);
create index idx_properties_featured on properties(featured) where featured = true;

-- ------------------------------------------------------------
-- IMÁGENES (Cloudinary)
-- ------------------------------------------------------------
create table property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,

  cloudinary_public_id text not null,   -- ej: "inmobiliaria/prop_123/img_1"
  secure_url text not null,             -- URL https de Cloudinary
  width integer,
  height integer,
  format text,                          -- jpg, png, webp

  is_cover boolean not null default false,
  sort_order smallint not null default 0,

  created_at timestamptz not null default now()
);

create unique index idx_one_cover_per_property
  on property_images(property_id)
  where is_cover = true;

create index idx_property_images_property_id on property_images(property_id);

-- ------------------------------------------------------------
-- AMENIDADES (catálogo + relación N:N)
-- ------------------------------------------------------------
create table amenities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,      -- 'Piscina', 'Cochera techada', 'Cisterna', etc.
  icon text                       -- nombre de ícono (lucide-react) opcional
);

create table property_amenities (
  property_id uuid not null references properties(id) on delete cascade,
  amenity_id uuid not null references amenities(id) on delete cascade,
  primary key (property_id, amenity_id)
);

-- ------------------------------------------------------------
-- LEADS / CONTACTOS
-- ------------------------------------------------------------
create table leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete set null,

  name text not null,
  phone text not null,
  email text,
  message text,

  source text default 'web', -- 'web', 'whatsapp', 'facebook'
  status lead_status not null default 'nuevo',

  created_at timestamptz not null default now()
);

create index idx_leads_property_id on leads(property_id);
create index idx_leads_status on leads(status);

-- ------------------------------------------------------------
-- TRIGGER: updated_at automático
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_properties_updated_at
  before update on properties
  for each row execute function set_updated_at();

create trigger trg_agents_updated_at
  before update on agents
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- RLS (Row Level Security) — lectura pública, escritura autenticada
-- ------------------------------------------------------------
alter table properties enable row level security;
alter table property_images enable row level security;
alter table amenities enable row level security;
alter table property_amenities enable row level security;
alter table leads enable row level security;
alter table agents enable row level security;

create policy "public_read_properties" on properties
  for select using (status <> 'inactivo');

create policy "public_read_images" on property_images
  for select using (true);

create policy "public_read_amenities" on amenities
  for select using (true);

create policy "public_read_property_amenities" on property_amenities
  for select using (true);

create policy "authenticated_write_properties" on properties
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated_write_images" on property_images
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "public_insert_leads" on leads
  for insert with check (true);

create policy "authenticated_read_leads" on leads
  for select using (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- CONFIGURACIÓN DEL SISTEMA (Cloudinary, etc.)
-- ------------------------------------------------------------
create table if not exists system_settings (
  key text primary key,
  value text not null,
  description text,
  updated_at timestamptz not null default now()
);

alter table system_settings enable row level security;

create policy "authenticated_read_settings" on system_settings
  for select using (auth.role() = 'authenticated');

create policy "authenticated_write_settings" on system_settings
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
