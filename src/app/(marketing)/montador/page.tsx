import type { Metadata } from "next";
import { getPartsByCategory } from "@/modules/parts/queries";
import { BuilderClient } from "@/components/builder/builder-client";

export const metadata: Metadata = {
  title: "Montador de PC",
  description:
    "Monte seu computador e compare preços entre lojas parceiras: mais barato, menos lojas ou melhor equilíbrio.",
};

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const groups = await getPartsByCategory();

  const initialSelection: Record<string, string> = {};
  for (const group of groups) {
    const preselected = params[group.category];
    if (preselected && group.parts.some((p) => p.id === preselected)) {
      initialSelection[group.category] = preselected;
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-semibold">Montador de PC</h1>
        <p className="text-muted-foreground">
          Escolha as peças e compare três estratégias de compra entre lojas
          parceiras.
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="text-muted-foreground">
          O catálogo de peças ainda está vazio.
        </p>
      ) : (
        <BuilderClient
          categories={groups.map((g) => ({
            category: g.category,
            label: g.label,
            parts: g.parts.map((p) => ({
              id: p.id,
              name: p.name,
              brand: p.brand,
              model: p.model,
              imageUrl: p.imageUrl,
            })),
          }))}
          initialSelection={
            Object.keys(initialSelection).length > 0 ? initialSelection : undefined
          }
        />
      )}
    </div>
  );
}
