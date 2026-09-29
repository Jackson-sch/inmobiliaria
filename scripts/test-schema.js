const { z } = require("zod");

const emptyToUndefined = (val) => {
  if (val === "" || val === null || val === undefined) return undefined;
  const num = Number(val);
  return isNaN(num) ? undefined : num;
};

const emptyOrZeroToUndefined = (val) => {
  if (val === "" || val === null || val === undefined) return undefined;
  const num = Number(val);
  if (isNaN(num) || num <= 0) return undefined;
  return num;
};

const schema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  type: z.enum(["casa", "departamento", "terreno", "oficina", "local_comercial"]),
  operation: z.enum(["venta", "alquiler"]),
  price: z.preprocess(emptyToUndefined, z.number().positive()),
  landAreaM2: z.preprocess(emptyOrZeroToUndefined, z.number().positive().optional()),
  builtAreaM2: z.preprocess(emptyOrZeroToUndefined, z.number().positive().optional()),
  bedrooms: z.preprocess(emptyToUndefined, z.number().int().min(0).optional()),
  bathrooms: z.preprocess(emptyToUndefined, z.number().int().min(0).optional()),
  parkingSpots: z.preprocess((v) => emptyToUndefined(v) ?? 0, z.number().int().min(0).default(0)),
  floors: z.preprocess(emptyOrZeroToUndefined, z.number().int().min(1).optional()),
  yearBuilt: z.preprocess(
    emptyOrZeroToUndefined,
    z.number().int().min(1900).max(2030).optional()
  ),
});

// Test 1: Terreno with 0 values
const t1 = schema.safeParse({
  title: "Terreno en Huanchaco con vista al mar",
  description: "Excelente terreno para construir casa de playa con vista panorámica.",
  type: "terreno",
  operation: "venta",
  price: 85000,
  landAreaM2: 250,
  builtAreaM2: 0,
  yearBuilt: 0,
  bedrooms: 0,
  bathrooms: 0,
  floors: 0,
  parkingSpots: 0,
});
console.log("Test 1 (Terreno con 0):", t1.success ? "SUCCESS" : t1.error.format());

// Test 2: Terreno with empty / NaN values
const t2 = schema.safeParse({
  title: "Terreno en Huanchaco con vista al mar",
  description: "Excelente terreno para construir casa de playa con vista panorámica.",
  type: "terreno",
  operation: "venta",
  price: 85000,
  landAreaM2: 300,
  builtAreaM2: NaN,
  yearBuilt: "",
  bedrooms: "",
  bathrooms: null,
  floors: NaN,
  parkingSpots: "",
});
console.log("Test 2 (Terreno con inputs vacíos/NaN):", t2.success ? "SUCCESS" : t2.error.format());

// Test 3: Invalid price (0 or negative)
const t3 = schema.safeParse({
  title: "Terreno inválido",
  description: "Descripción de prueba para terreno inválido.",
  type: "terreno",
  operation: "venta",
  price: 0,
});
console.log("Test 3 (Precio 0 debe fallar):", !t3.success ? "SUCCESS (Correctly rejected)" : "FAILED");
