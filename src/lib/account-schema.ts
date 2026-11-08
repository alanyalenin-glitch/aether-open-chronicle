import { z } from "zod";
import { ZODIAC } from "@/lib/identity";

export const registrationSchema = z.object({
  fullName: z.string().trim().min(3, "Escribe tu nombre completo").max(100).refine((value) => value.split(/\s+/).length >= 2, "Incluye nombre y apellido"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha no válida").refine((value) => !Number.isNaN(Date.parse(value)) && value < new Date().toISOString().slice(0, 10), "Fecha no válida"),
  zodiac: z.enum(ZODIAC),
  simulationCompleted: z.literal(true),
});
export const groupSchema = z.object({ name: z.string().trim().min(1).max(100), description: z.string().trim().max(500), category: z.string().trim().min(1).max(60) });
export const emailSchema = z.string().trim().email("Correo no válido");
export const passwordSchema = z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(128);