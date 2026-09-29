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
    DROP POLICY IF EXISTS "public_read_agents" ON agents;
    CREATE POLICY "public_read_agents" ON agents FOR SELECT USING (true);

    DROP POLICY IF EXISTS "authenticated_write_agents" ON agents;
    CREATE POLICY "authenticated_write_agents" ON agents FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

    DROP POLICY IF EXISTS "public_read_settings" ON system_settings;
    CREATE POLICY "public_read_settings" ON system_settings FOR SELECT USING (key NOT IN ('cloudinary_api_secret', 'telegram_bot_token'));
  `;

  await client.query(sql);
  console.log("RLS policies applied successfully!");

  await client.end();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
