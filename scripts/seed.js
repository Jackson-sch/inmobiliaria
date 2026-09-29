const { Client } = require('pg');

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.zwuitqedgtrlyydaewoc:pjsCBvmL53JZY5OK@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

async function seed() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Conectado a PostgreSQL para insertar datos de prueba...');

    // 1. Obtener el agente existente
    const agentRes = await client.query('SELECT id FROM agents LIMIT 1');
    if (agentRes.rows.length === 0) {
      throw new Error('No se encontró ningún agente en la base de datos.');
    }
    const agentId = agentRes.rows[0].id;

    // 2. Obtener las amenidades
    const amenRes = await client.query('SELECT id, name FROM amenities');
    const amenitiesMap = {};
    for (const row of amenRes.rows) {
      amenitiesMap[row.name] = row.id;
    }

    // 3. Lista de propiedades de prueba
    const sampleProperties = [
      {
        title: 'Residencia Moderna con Piscina y Jardín en El Golf',
        slug: 'residencia-moderna-piscina-el-golf',
        description:
          'Espectacular casa de diseño vanguardista ubicada en la zona más exclusiva de El Golf. Cuenta con amplios ambientes iluminados naturalmente, sala con doble altura, cocina tipo isla con acabados en granito y cuarzo, terraza con zona BBQ y piscina privada con deck de madera. En el segundo nivel se encuentran 4 dormitorios, todos con baño propio y walk-in closet.',
        type: 'casa',
        operation: 'venta',
        status: 'disponible',
        price: 385000,
        currency: 'USD',
        address: 'Calle Los Ciruelos 240, Urb. El Golf',
        district: 'Victor Larco Herrera',
        city: 'Trujillo',
        latitude: -8.1362,
        longitude: -79.0345,
        land_area_m2: 320,
        built_area_m2: 290,
        bedrooms: 4,
        bathrooms: 4,
        parking_spots: 2,
        floors: 2,
        year_built: 2022,
        featured: true,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed/el-golf-1',
            isCover: true,
            sortOrder: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed/el-golf-2',
            isCover: false,
            sortOrder: 1,
          },
          {
            url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed/el-golf-3',
            isCover: false,
            sortOrder: 2,
          },
        ],
        amenities: ['Piscina', 'Cochera techada', 'Jardín / Terraza', 'Seguridad 24/7', 'Área de parrilla'],
      },
      {
        title: 'Exclusivo Departamento Flat frente a Parque en California',
        slug: 'exclusivo-departamento-frente-parque-california',
        description:
          'Hermoso departamento con vista privilegiada a parque en una calle tranquila y residencial de California. Acabados premium en pisos de madera estructurada, cocina equipada con campana y encimera, sala comedor espaciosa con mamparas de piso a techo y balcón amplio. Edificio con ascensor directo al departamento.',
        type: 'departamento',
        operation: 'venta',
        status: 'disponible',
        price: 168000,
        currency: 'USD',
        address: 'Av. Las Palmas 315, Urb. California',
        district: 'Victor Larco Herrera',
        city: 'Trujillo',
        latitude: -8.1315,
        longitude: -79.0381,
        land_area_m2: null,
        built_area_m2: 138,
        bedrooms: 3,
        bathrooms: 3,
        parking_spots: 1,
        floors: 1,
        year_built: 2023,
        featured: true,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed/california-1',
            isCover: true,
            sortOrder: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed/california-2',
            isCover: false,
            sortOrder: 1,
          },
        ],
        amenities: ['Ascensor', 'Cochera techada', 'Seguridad 24/7', 'Vista panorámica'],
      },
      {
        title: 'Casa de Playa con Terraza y Vista al Mar en Huanchaco',
        slug: 'casa-playa-terraza-vista-mar-huanchaco',
        description:
          'Vive la brisa marina todos los días en esta acogedora casa playera en Huanchaco. Cuenta con 3 niveles, amplia terraza en el último piso perfecta para ver los atardeceres y olas, sala de estar rústica-moderna, cocina abierta y cochera para 2 camionetas. Ideal para descanso familiar o renta turística.',
        type: 'casa',
        operation: 'alquiler',
        status: 'disponible',
        price: 4500,
        currency: 'PEN',
        address: 'Av. La Rivera 520, Balneario de Huanchaco',
        district: 'Huanchaco',
        city: 'Trujillo',
        latitude: -8.0772,
        longitude: -79.1215,
        land_area_m2: 190,
        built_area_m2: 175,
        bedrooms: 3,
        bathrooms: 3,
        parking_spots: 2,
        floors: 3,
        year_built: 2021,
        featured: true,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed/huanchaco-1',
            isCover: true,
            sortOrder: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed/huanchaco-2',
            isCover: false,
            sortOrder: 1,
          },
        ],
        amenities: ['Vista panorámica', 'Jardín / Terraza', 'Área de parrilla', 'Cochera techada'],
      },
      {
        title: 'Moderno Departamento de Estreno en San Andrés',
        slug: 'departamento-estreno-san-andres-trujillo',
        description:
          'Departamento acogedor y muy bien distribuido a pocos pasos de la Universidad Nacional de Trujillo y centros comerciales. Sala comedor con piso porcelanato, cocina con reposteros altos y bajos, lavandería independiente y dormitorio principal con baño incorporado. Mantenimiento bajo y excelente conectividad.',
        type: 'departamento',
        operation: 'alquiler',
        status: 'disponible',
        price: 2300,
        currency: 'PEN',
        address: 'Calle Los Pinos 180, Urb. San Andrés',
        district: 'Trujillo',
        city: 'Trujillo',
        latitude: -8.1158,
        longitude: -79.0302,
        land_area_m2: null,
        built_area_m2: 88,
        bedrooms: 2,
        bathrooms: 2,
        parking_spots: 1,
        floors: 1,
        year_built: 2024,
        featured: true,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed/san-andres-1',
            isCover: true,
            sortOrder: 0,
          },
        ],
        amenities: ['Ascensor', 'Cochera techada', 'Cisterna y bomba', 'Seguridad 24/7'],
      },
      {
        title: 'Terreno Urbano en Condominio Privado Campestre en Moche',
        slug: 'terreno-urbano-condominio-privado-moche',
        description:
          'Lote completamente independizado con título en Registros Públicos listo para transferir. Dentro de un condominio cerrado con pórtico de ingreso, áreas verdes, servicios básicos de agua, luz y desagüe instalados. Clima cálido todo el año, ideal para construir casa de campo con piscina.',
        type: 'terreno',
        operation: 'venta',
        status: 'disponible',
        price: 89000,
        currency: 'USD',
        address: 'Fundo Santa Elena, Lote B-14',
        district: 'Moche',
        city: 'Trujillo',
        latitude: -8.1685,
        longitude: -79.0062,
        land_area_m2: 450,
        built_area_m2: null,
        bedrooms: null,
        bathrooms: null,
        parking_spots: 0,
        floors: null,
        year_built: null,
        featured: false,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed/moche-1',
            isCover: true,
            sortOrder: 0,
          },
        ],
        amenities: ['Seguridad 24/7', 'Jardín / Terraza'],
      },
      {
        title: 'Local Comercial de Alto Tránsito en Av. Larco',
        slug: 'local-comercial-alto-transito-av-larco',
        description:
          'Estratégico local a nivel de calle con excelente visibilidad y flujo vehicular y peatonal constante. Fachada de vidrio templado, salón principal diáfano, 2 medios baños, depósito trasero y área de descarga. Ideal para farmacias, bancos, franquicias, cafeterías o centros de atención médica.',
        type: 'local_comercial',
        operation: 'alquiler',
        status: 'disponible',
        price: 7500,
        currency: 'PEN',
        address: 'Av. Víctor Larco Herrera 880',
        district: 'Victor Larco Herrera',
        city: 'Trujillo',
        latitude: -8.1251,
        longitude: -79.0398,
        land_area_m2: 160,
        built_area_m2: 155,
        bedrooms: null,
        bathrooms: 2,
        parking_spots: 2,
        floors: 1,
        year_built: 2019,
        featured: false,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
            publicId: 'seed/larco-1',
            isCover: true,
            sortOrder: 0,
          },
        ],
        amenities: ['Seguridad 24/7', 'Cisterna y bomba'],
      },
    ];

    // 4. Limpiar datos de prueba previos si existen para evitar duplicados por slug
    console.log('Insertando propiedades...');
    for (const prop of sampleProperties) {
      // Verificar si ya existe por slug
      const checkRes = await client.query('SELECT id FROM properties WHERE slug = $1', [prop.slug]);
      let propId;

      if (checkRes.rows.length > 0) {
        propId = checkRes.rows[0].id;
        console.log(`Propiedad "${prop.title}" ya existía, actualizando...`);
      } else {
        const insertRes = await client.query(
          `
          INSERT INTO properties (
            agent_id, title, slug, description, type, operation, status,
            price, currency, address, district, city, latitude, longitude,
            land_area_m2, built_area_m2, bedrooms, bathrooms, parking_spots,
            floors, year_built, featured
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
          RETURNING id;
        `,
          [
            agentId,
            prop.title,
            prop.slug,
            prop.description,
            prop.type,
            prop.operation,
            prop.status,
            prop.price,
            prop.currency,
            prop.address,
            prop.district,
            prop.city,
            prop.latitude,
            prop.longitude,
            prop.land_area_m2,
            prop.built_area_m2,
            prop.bedrooms,
            prop.bathrooms,
            prop.parking_spots,
            prop.floors,
            prop.year_built,
            prop.featured,
          ]
        );
        propId = insertRes.rows[0].id;
        console.log(`✓ Creada propiedad: ${prop.title}`);
      }

      // Insertar imágenes si no existen
      await client.query('DELETE FROM property_images WHERE property_id = $1', [propId]);
      for (const img of prop.images) {
        await client.query(
          `
          INSERT INTO property_images (property_id, cloudinary_public_id, secure_url, width, height, format, is_cover, sort_order)
          VALUES ($1, $2, $3, 1200, 800, 'jpg', $4, $5);
        `,
          [propId, img.publicId, img.url, img.isCover, img.sortOrder]
        );
      }

      // Asociar amenidades
      await client.query('DELETE FROM property_amenities WHERE property_id = $1', [propId]);
      for (const amenName of prop.amenities) {
        const amenId = amenitiesMap[amenName];
        if (amenId) {
          await client.query(
            `
            INSERT INTO property_amenities (property_id, amenity_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING;
          `,
            [propId, amenId]
          );
        }
      }
    }

    console.log('¡Seeding completado con éxito!');
    await client.end();
  } catch (err) {
    console.error('Error durante el seed:', err);
    process.exit(1);
  }
}

seed();
