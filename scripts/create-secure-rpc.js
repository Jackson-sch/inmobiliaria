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
    CREATE OR REPLACE FUNCTION get_telegram_config_secure(secret_key text)
    RETURNS TABLE (bot_token text, chat_id text)
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      IF secret_key <> 'inmobiliaria_internal_secret_998877' THEN
        RAISE EXCEPTION 'Unauthorized';
      END IF;
      RETURN QUERY
      SELECT 
        (SELECT value FROM system_settings WHERE key = 'telegram_bot_token' LIMIT 1),
        (SELECT value FROM system_settings WHERE key = 'telegram_chat_id' LIMIT 1);
    END;
    $$;

    GRANT EXECUTE ON FUNCTION get_telegram_config_secure(text) TO anon, authenticated, service_role;
  `;

  await client.query(sql);
  console.log("Secure RPC get_telegram_config_secure verified and granted.");
  await client.end();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
