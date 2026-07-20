import { z } from "zod";

export const reportReasons = [
  "COUNTERFEIT",
  "PROHIBITED_ITEM",
  "MISLEADING",
  "SPAM",
  "SCAM",
  "OTHER",
] as const;

export const reportSchema = z.object({
  listingId: z.string().min(1),
  reason: z.enum(reportReasons),
  details: z.string().max(1000).optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;

export const REPORT_REASON_LABELS: Record<(typeof reportReasons)[number], string> = {
  COUNTERFEIT: "Item falsificado",
  PROHIBITED_ITEM: "Item proibido",
  MISLEADING: "Anúncio enganoso",
  SPAM: "Spam",
  SCAM: "Golpe / fraude",
  OTHER: "Outro motivo",
};
