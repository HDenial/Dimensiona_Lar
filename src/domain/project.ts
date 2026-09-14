import { z } from "zod";

const positive = z.number().finite().positive();
const nonnegative = z.number().finite().nonnegative();
const text = z.string().max(500);
export const roomTypes = [
  "Quarto",
  "Sala",
  "Cozinha",
  "Banheiro",
  "Área de serviço",
  "Corredor",
  "Varanda",
  "Garagem",
  "Outro",
] as const;
export const loadTypes = [
  "Chuveiro",
  "Forno elétrico",
  "Máquina de lavar",
  "Ar-condicionado",
  "Torneira elétrica",
  "Bomba",
  "Cooktop",
  "Micro-ondas",
  "Lava-louças",
  "Outro",
] as const;
export const installationSchema = z.object({
  tipo: z.literal("residencial"),
  sistema: z.enum(["mono", "bi", "tri"]),
  vf: positive,
  vff: positive,
  freq: positive,
  material: z.enum(["Cu", "Al"]),
  isolacao: z.enum(["PVC 70 °C", "XLPE/EPR 90 °C"]),
  temp: z.number().finite(),
  quedaLimite: positive,
  distAlim: nonnegative,
  expansao: nonnegative,
});
export const roomSchema = z.object({
  id: text.min(1),
  name: text,
  type: z.enum(roomTypes),
  l: positive,
  w: positive,
  perimeter: positive.optional(),
  lamp: nonnegative.optional(),
  tugs: nonnegative.int().optional(),
  tugVA: nonnegative.optional(),
});
export const loadSchema = z.object({
  id: text.min(1),
  type: z.enum(loadTypes),
  name: text,
  room: text,
  p: nonnegative,
  v: positive,
  fp: positive.max(1),
  q: positive.int(),
  d: nonnegative,
  connection: z.enum(["single", "three"]).optional(),
});
export const circuitSchema = z.object({
  id: text.min(1),
  name: text,
  type: z.enum(["Iluminação", "TUG", "TUE"]),
  p: nonnegative,
  d: nonnegative,
  fp: positive.max(1),
  phase: z.enum(["A", "B", "C", "AB", "BC", "CA", "ABC"]),
  powerUnit: z.enum(["W", "VA"]).optional(),
  voltage: positive.optional(),
  connection: z.enum(["FN", "FF", "3F"]).optional(),
  distanceKnown: z.boolean().optional(),
  loadId: text.optional(),
});
export const projectSchema = z
  .object({
    schemaVersion: z.union([z.literal(1), z.literal(2)]).default(1),
    step: z.number().int().min(1).max(8).default(1),
    installation: installationSchema,
    rooms: z.array(roomSchema).max(1000),
    loads: z.array(loadSchema).max(1000),
    circuits: z.array(circuitSchema).max(3000),
  })
  .superRefine((project, context) => {
    for (const key of ["rooms", "loads", "circuits"] as const) {
      if (
        new Set(project[key].map((item) => item.id)).size !==
        project[key].length
      ) {
        context.addIssue({
          code: "custom",
          path: [key],
          message: "Identificadores duplicados.",
        });
      }
    }
  });
export type Installation = z.infer<typeof installationSchema>;
export type Room = z.infer<typeof roomSchema>;
export type Load = z.infer<typeof loadSchema>;
export type Circuit = z.infer<typeof circuitSchema>;
export type Project = z.infer<typeof projectSchema>;
export const uid = () => crypto.randomUUID();
export function createProject(): Project {
  return {
    schemaVersion: 2,
    step: 1,
    installation: {
      tipo: "residencial",
      sistema: "mono",
      vf: 127,
      vff: 220,
      freq: 60,
      material: "Cu",
      isolacao: "PVC 70 °C",
      temp: 30,
      quedaLimite: 4,
      distAlim: 10,
      expansao: 20,
    },
    rooms: [],
    loads: [],
    circuits: [],
  };
}
