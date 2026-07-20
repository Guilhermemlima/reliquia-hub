"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approveMatchReview, rejectMatchReview } from "@/modules/affiliate/review-actions";
import { PART_CATEGORY_LABELS } from "@/modules/parts/queries";

const METHOD_LABELS: Record<string, string> = {
  ean: "EAN",
  mpn: "MPN",
  brand_model: "Marca + modelo",
  fuzzy_name: "Nome aproximado",
};

export function ReviewRow({
  review,
}: {
  review: {
    id: string;
    rawLabel: string;
    confidenceScore: number;
    matchMethod: string;
    candidatePart: { name: string; category: string } | null;
  };
}) {
  const [isPending, startTransition] = useTransition();

  function approve() {
    startTransition(async () => {
      const result = await approveMatchReview(review.id);
      if (result.error) toast.error(result.error);
      else toast.success("Associação aprovada — oferta criada.");
    });
  }

  function reject() {
    startTransition(async () => {
      const result = await rejectMatchReview(review.id);
      if (result.error) toast.error(result.error);
      else toast.success("Revisão descartada.");
    });
  }

  return (
    <TableRow>
      <TableCell className="max-w-xs truncate">{review.rawLabel}</TableCell>
      <TableCell>
        {review.candidatePart
          ? `${PART_CATEGORY_LABELS[review.candidatePart.category] ?? review.candidatePart.category} — ${review.candidatePart.name}`
          : "—"}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{Math.round(review.confidenceScore * 100)}%</Badge>
      </TableCell>
      <TableCell>{METHOD_LABELS[review.matchMethod] ?? review.matchMethod}</TableCell>
      <TableCell className="space-x-2 text-right">
        <Button size="sm" disabled={isPending} onClick={approve}>
          Aprovar
        </Button>
        <Button size="sm" variant="outline" disabled={isPending} onClick={reject}>
          Rejeitar
        </Button>
      </TableCell>
    </TableRow>
  );
}
