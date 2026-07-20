"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { StrategyCard } from "@/components/builder/strategy-card";
import { computeBuild } from "@/modules/builder/actions";
import type { BuildStrategiesResult } from "@/modules/builder/queries";

type PartOption = { id: string; name: string; brand: string; model: string };
type CategoryGroup = { category: string; label: string; parts: PartOption[] };

export function BuilderClient({
  categories,
  initialSelection,
}: {
  categories: CategoryGroup[];
  initialSelection?: Record<string, string>;
}) {
  const [selection, setSelection] = useState<Record<string, string>>(() => {
    if (initialSelection) return initialSelection;
    const defaults: Record<string, string> = {};
    for (const group of categories) {
      if (group.parts[0]) defaults[group.category] = group.parts[0].id;
    }
    return defaults;
  });
  const [result, setResult] = useState<BuildStrategiesResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const partIds = useMemo(() => Object.values(selection).filter(Boolean), [selection]);
  const partLabels = useMemo(() => {
    const map: Record<string, { name: string; category: string }> = {};
    for (const group of categories) {
      for (const part of group.parts) {
        map[part.id] = { name: part.name, category: group.category };
      }
    }
    return map;
  }, [categories]);

  useEffect(() => {
    if (partIds.length === 0) return;
    startTransition(async () => {
      const res = await computeBuild(partIds);
      setResult(res);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(partIds)]);

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <Card className="h-fit">
        <CardContent className="space-y-4 pt-6">
          <h2 className="font-heading text-lg font-semibold">Escolha as peças</h2>
          {categories.map((group) => (
            <Field key={group.category}>
              <FieldLabel htmlFor={`part-${group.category}`}>{group.label}</FieldLabel>
              <Select
                value={selection[group.category] ?? ""}
                onValueChange={(v) =>
                  setSelection((prev) => ({ ...prev, [group.category]: v ?? "" }))
                }
              >
                <SelectTrigger id={`part-${group.category}`} className="w-full">
                  <SelectValue>
                    {(value: string | null) =>
                      group.parts.find((p) => p.id === value)?.name ?? "Selecione"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {group.parts.map((part) => (
                    <SelectItem key={part.id} value={part.id}>
                      {part.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ))}
        </CardContent>
      </Card>

      <div>
        {isPending && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Calculando melhores ofertas...
          </div>
        )}

        {!isPending && result && !result.ok && (
          <p className="text-muted-foreground">
            Ainda não há ofertas cadastradas para algumas peças selecionadas.
            Tente outra combinação ou volte mais tarde.
          </p>
        )}

        {!isPending && result?.ok && (
          <div className="grid gap-4 sm:grid-cols-3">
            <StrategyCard
              title="Mais barato"
              description="Menor preço por peça, não importa a loja."
              strategy={result.cheapest}
              partLabels={partLabels}
            />
            <StrategyCard
              title="Menos lojas"
              description="Concentra a compra no menor número de lojas possível."
              strategy={result.fewestStores}
              partLabels={partLabels}
            />
            <StrategyCard
              title="Melhor equilíbrio"
              description="Bom preço sem espalhar a compra em muitas lojas."
              strategy={result.balanced}
              partLabels={partLabels}
              highlight
            />
          </div>
        )}
      </div>
    </div>
  );
}
