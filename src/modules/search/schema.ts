import { z } from "zod";

export const searchParamsSchema = z.object({
  q: z.string().trim().optional(),
  category: z.string().optional(),
  condition: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional().catch(undefined),
  maxPrice: z.coerce.number().positive().optional().catch(undefined),
  sort: z.enum(["relevance", "price_asc", "price_desc", "newest"]).default("relevance"),
  page: z.coerce.number().int().positive().default(1).catch(1),
});

export type SearchFilters = z.infer<typeof searchParamsSchema>;
