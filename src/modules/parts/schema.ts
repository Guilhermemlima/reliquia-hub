import { z } from "zod";

export const partCategories = [
  "CPU",
  "GPU",
  "RAM",
  "STORAGE",
  "PSU",
  "MOTHERBOARD",
  "CASE",
  "COOLER",
  "MONITOR",
  "PERIPHERAL",
] as const;

export const partSchema = z.object({
  category: z.enum(partCategories),
  brand: z.string().min(1, "Informe a marca"),
  model: z.string().min(1, "Informe o modelo"),
  name: z.string().min(1, "Informe o nome"),
  ean: z.string().optional(),
  mpn: z.string().optional(),
  imageUrl: z.string().url("URL de imagem inválida").optional().or(z.literal("")),
});

export type PartInput = z.infer<typeof partSchema>;

export const partImageSchema = z.object({
  partId: z.string().min(1),
  imageUrl: z.string().url("URL de imagem inválida"),
});
