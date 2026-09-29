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

  const triggers = await client.query(`
    SELECT trigger_name, event_manipulation, action_statement
    FROM information_schema.triggers
    WHERE event_object_schema = 'auth' AND event_object_table = 'users';
  `);
  console.log("Triggers on auth.users:", triggers.rows);

  const func = await client.query(`
    SELECT routine_name, routine_definition
    FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_name = 'prevent_public_signups';
  `);
  console.log("Function definition:", func.rows[0]?.routine_definition);

  const users = await client.query(`
    SELECT id, email, created_at, invited_at, email_confirmed_at, raw_app_meta_data
    FROM auth.users;
  `);
  console.log("Existing users in auth.users:", users.rows);

  await client.end();
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
