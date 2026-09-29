const { Client } = require("pg");

const connectionString =
  "postgresql://postgres.zwuitqedgtrlyydaewoc:pjsCBvmL53JZY5OK@aws-0-us-west-2.pooler.supabase.com:5432/postgres";

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Connected to Supabase PostgreSQL");

  const sql = `
    CREATE OR REPLACE FUNCTION public.prevent_public_signups()
    RETURNS trigger AS $$
    BEGIN
      -- 1. Permitir siempre invitaciones enviadas desde el Dashboard de Supabase
      IF NEW.invited_at IS NOT NULL THEN
        RETURN NEW;
      END IF;

      -- 2. Permitir si el correo pertenece a la lista autorizada de administradores
      IF NEW.email IN (
        'darwinjackson.12@gmail.com',
        'jackson.sebastian.2793@gmail.com'
      ) THEN
        RETURN NEW;
      END IF;

      -- 3. Bloquear cualquier auto-registro público no autorizado
      RAISE EXCEPTION 'El auto-registro público está desactivado en esta plataforma por seguridad.';
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS tr_prevent_public_signups ON auth.users;
    CREATE TRIGGER tr_prevent_public_signups
      BEFORE INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.prevent_public_signups();
  `;

  await client.query(sql);
  console.log("Trigger updated: allows dashboard invites and authorized admins, blocks public signups!");

  await client.end();
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
