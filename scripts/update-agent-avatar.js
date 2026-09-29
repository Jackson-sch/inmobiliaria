const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.zwuitqedgtrlyydaewoc:pjsCBvmL53JZY5OK@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  await client.query("UPDATE agents SET avatar_url = '/jean-mendocilla-office.jpg' WHERE full_name ILIKE '%Jean Mendocilla%'");
  console.log('✓ Agent avatar_url updated in database!');
  await client.end();
}

run();
