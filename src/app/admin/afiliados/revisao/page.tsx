import type { Metadata } from "next";
import { getPendingMatchReviews } from "@/modules/affiliate/review-queries";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReviewRow } from "@/components/admin/affiliate/review-row";

export const metadata: Metadata = { title: "Revisão de associações · Admin" };

export default async function ReviewMatchesPage() {
  const reviews = await getPendingMatchReviews();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold">
          Revisão de associações
        </h1>
        <p className="text-muted-foreground">
          Linhas importadas por CSV que foram associadas a uma peça do
          catálogo com confiança média — confirme ou rejeite antes da oferta
          entrar no ar.
        </p>
      </div>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma associação pendente.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Linha importada</TableHead>
                <TableHead>Peça sugerida</TableHead>
                <TableHead>Confiança</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <ReviewRow
                  key={review.id}
                  review={{
                    id: review.id,
                    rawLabel: review.rawLabel,
                    confidenceScore: review.confidenceScore,
                    matchMethod: review.matchMethod,
                    candidatePart: review.candidatePart
                      ? { name: review.candidatePart.name, category: review.candidatePart.category }
                      : null,
                  }}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
