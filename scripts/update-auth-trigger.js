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
      -- 1. Permitir siempre si el usuario se crea desde el Dashboard de Supabase o Service Role (no anónimo)
      IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'anon' THEN
        RETURN NEW;
      END IF;

      -- 2. Permitir si tiene invited_at o email_confirmed_at (acciones directas de administrador)
      IF NEW.invited_at IS NOT NULL OR NEW.email_confirmed_at IS NOT NULL THEN
        RETURN NEW;
      END IF;

      -- 3. Permitir si el correo pertenece a la lista de administradores autorizados
      IF NEW.email IN (
        'darwinjackson.12@gmail.com',
        'jackson.sebastian.2793@gmail.com',
        'jeanms1881@gmail.com'
      ) THEN
        RETURN NEW;
      END IF;

      -- 4. Bloquear únicamente intentos de auto-registro anónimos públicos desde la web
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
  console.log("Trigger successfully updated in Supabase!");

  await client.end();
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
