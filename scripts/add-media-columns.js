const { Client } = require("pg");

const connectionString =
  "postgresql://postgres.zwuitqedgtrlyydaewoc:pjsCBvmL53JZY5OK@aws-0-us-west-2.pooler.supabase.com:5432/postgres";

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Connected to PostgreSQL");

  const sql = `
    ALTER TABLE properties
      ADD COLUMN IF NOT EXISTS video_url text,
      ADD COLUMN IF NOT EXISTS video_public_id text,
      ADD COLUMN IF NOT EXISTS pdf_url text,
      ADD COLUMN IF NOT EXISTS pdf_public_id text,
      ADD COLUMN IF NOT EXISTS pdf_name text;
  `;

  await client.query(sql);
  console.log("Columns video_url, video_public_id, pdf_url, pdf_public_id, pdf_name added successfully!");

  await client.end();
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
