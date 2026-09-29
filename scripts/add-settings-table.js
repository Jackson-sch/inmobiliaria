const { Client } = require('pg');

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.zwuitqedgtrlyydaewoc:pjsCBvmL53JZY5OK@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Creando tabla system_settings...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "authenticated_read_settings" ON system_settings;
      CREATE POLICY "authenticated_read_settings" ON system_settings
        FOR SELECT USING (auth.role() = 'authenticated');

      DROP POLICY IF EXISTS "authenticated_write_settings" ON system_settings;
      CREATE POLICY "authenticated_write_settings" ON system_settings
        FOR ALL USING (auth.role() = 'authenticated')
        WITH CHECK (auth.role() = 'authenticated');
    `);

    console.log('✓ Tabla system_settings configurada correctamente!');
    await client.end();
  } catch (err) {
    console.error('Error al configurar system_settings:', err);
    process.exit(1);
  }
}

run();
