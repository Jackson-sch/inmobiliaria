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
      -- Si ya existe al menos 1 administrador registrado, rechazar cualquier nuevo registro público
      IF (SELECT count(*) FROM auth.users) >= 1 THEN
        RAISE EXCEPTION 'El auto-registro público está desactivado en esta plataforma por seguridad.';
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS tr_prevent_public_signups ON auth.users;
    CREATE TRIGGER tr_prevent_public_signups
      BEFORE INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.prevent_public_signups();
  `;

  await client.query(sql);
  console.log("Database trigger 'tr_prevent_public_signups' created successfully!");

  await client.end();
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
