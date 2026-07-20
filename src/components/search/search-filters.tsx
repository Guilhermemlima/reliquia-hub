"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONDITION_LABELS } from "@/lib/format";

type CategoryOption = { slug: string; name: string };

export function SearchFilters({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/search?${params.toString()}`);
  }

  function onPriceSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    params.delete("page");
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <Field>
        <FieldLabel>Categoria</FieldLabel>
        <Select
          value={searchParams.get("category") ?? "all"}
          onValueChange={(v) => updateParam("category", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string | null) =>
                categories.find((c) => c.slug === value)?.name ??
                "Todas as categorias"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.slug} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Estado de conservação</FieldLabel>
        <Select
          value={searchParams.get("condition") ?? "all"}
          onValueChange={(v) => updateParam("condition", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string | null) =>
                (value && CONDITION_LABELS[value]) ?? "Qualquer estado"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Qualquer estado</SelectItem>
            {Object.entries(CONDITION_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <form onSubmit={onPriceSubmit} className="space-y-2">
        <FieldLabel>Faixa de preço (BRL)</FieldLabel>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Mín"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            placeholder="Máx"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline" size="sm" className="w-full">
          Aplicar
        </Button>
      </form>
    </div>
  );
}

const SORT_LABELS: Record<string, string> = {
  relevance: "Mais relevantes",
  newest: "Mais recentes",
  price_asc: "Menor preço",
  price_desc: "Maior preço",
};

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Select
      value={searchParams.get("sort") ?? "relevance"}
      onValueChange={(v) => {
        const params = new URLSearchParams(searchParams.toString());
        if (v && v !== "relevance") params.set("sort", v);
        else params.delete("sort");
        router.push(`/search?${params.toString()}`);
      }}
    >
      <SelectTrigger className="w-48">
        <SelectValue>
          {(value: string | null) => SORT_LABELS[value ?? "relevance"]}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="relevance">Mais relevantes</SelectItem>
        <SelectItem value="newest">Mais recentes</SelectItem>
        <SelectItem value="price_asc">Menor preço</SelectItem>
        <SelectItem value="price_desc">Maior preço</SelectItem>
      </SelectContent>
    </Select>
  );
}
