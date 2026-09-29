const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.zwuitqedgtrlyydaewoc:pjsCBvmL53JZY5OK@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('Connected!');

    const sqlPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing schema.sql...');
    await client.query(sql);
    console.log('Schema executed successfully!');

    // Check created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Tables in public schema:', res.rows.map((r) => r.table_name));

    // Ensure default agent exists
    const agentRes = await client.query('SELECT id, full_name FROM agents LIMIT 1');
    if (agentRes.rows.length === 0) {
      console.log('Inserting default agent Jean Mendocilla...');
      await client.query(`
        INSERT INTO agents (full_name, phone, whatsapp, email, bio, facebook_url)
        VALUES (
          'Jean Mendocilla',
          '+51 900 000 000',
          '+51900000000',
          'contacto@jeanmendocilla.com',
          'Asesor Inmobiliario en Trujillo, Perú.',
          'https://www.facebook.com/jean.mendocillasebastian'
        );
      `);
      console.log('Default agent inserted!');
    } else {
      console.log('Agent already exists:', agentRes.rows[0].full_name);
    }

    // Insert initial amenities if empty
    const amenRes = await client.query('SELECT count(*) FROM amenities');
    if (parseInt(amenRes.rows[0].count, 10) === 0) {
      console.log('Inserting standard amenities...');
      await client.query(`
        INSERT INTO amenities (name, icon) VALUES
        ('Cochera techada', 'Car'),
        ('Piscina', 'Waves'),
        ('Jardín / Terraza', 'Trees'),
        ('Seguridad 24/7', 'ShieldCheck'),
        ('Ascensor', 'ArrowUpDown'),
        ('Área de parrilla', 'Flame'),
        ('Cisterna y bomba', 'Droplets'),
        ('Vista panorámica', 'Eye');
      `);
      console.log('Standard amenities inserted!');
    }

    await client.end();
    console.log('Database setup complete!');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

run();
