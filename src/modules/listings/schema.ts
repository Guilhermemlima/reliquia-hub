import { z } from "zod";

export const listingConditions = [
  "NEW",
  "LIKE_NEW",
  "VERY_GOOD",
  "GOOD",
  "ACCEPTABLE",
  "FOR_PARTS",
] as const;

export const listingImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
});

export const listingSchema = z.object({
  title: z.string().min(5, "Título muito curto").max(120),
  description: z.string().min(20, "Descreva melhor o item").max(5000),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  condition: z.enum(listingConditions),
  price: z.coerce.number().positive("Informe um preço válido"),
  quantity: z.coerce.number().int().min(1).max(999).default(1),
  attributes: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
  images: z.array(listingImageSchema).min(1, "Adicione pelo menos uma foto").max(12),
});

export type ListingInput = z.infer<typeof listingSchema>;
