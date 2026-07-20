"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  ImageUploader,
  type ListingImageValue,
} from "@/components/listings/image-uploader";
import { listingSchema, type ListingInput } from "@/modules/listings/schema";
import {
  createListing,
  updateListing,
} from "@/modules/listings/actions";
import { CONDITION_LABELS } from "@/lib/format";
import type { CategoryAttributeField } from "@/modules/categories/queries";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  attributesSchema: unknown;
};

export function ListingForm({
  categories,
  listingId,
  defaultValues,
}: {
  categories: CategoryOption[];
  listingId?: string;
  defaultValues?: Partial<ListingInput>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ListingImageValue[]>(
    defaultValues?.images ?? []
  );
  const [attributes, setAttributes] = useState<Record<string, string | number>>(
    defaultValues?.attributes ?? {}
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ListingInput>({
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      condition: "GOOD",
      price: 0,
      quantity: 1,
      attributes: {},
      images: [],
      ...defaultValues,
    },
  });

  const categoryId = watch("categoryId");

  const attributeFields: CategoryAttributeField[] = useMemo(() => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category || !Array.isArray(category.attributesSchema)) return [];
    return category.attributesSchema as CategoryAttributeField[];
  }, [categories, categoryId]);

  async function onSubmit(values: ListingInput) {
    const payload: ListingInput = { ...values, images, attributes };

    const parsed = listingSchema.safeParse(payload);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          setError(field as keyof ListingInput, { message: issue.message });
        }
      }
      toast.error(parsed.error.issues[0]?.message ?? "Revise os campos do anúncio.");
      return;
    }

    setLoading(true);
    const result = listingId
      ? await updateListing(listingId, parsed.data)
      : await createListing(parsed.data);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(listingId ? "Anúncio atualizado!" : "Anúncio publicado!");
    router.push(`/listings/${result.slug}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardContent className="pt-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="title">Título do anúncio</FieldLabel>
                <Input
                  id="title"
                  placeholder="Ex: Cartucho Chrono Trigger SNES original"
                  {...register("title")}
                />
                <FieldError errors={[errors.title]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="categoryId">Categoria</FieldLabel>
                <Select
                  value={categoryId}
                  onValueChange={(v) =>
                    setValue("categoryId", v ?? "", { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="categoryId" className="w-full">
                    <SelectValue placeholder="Selecione a categoria">
                      {(value: string | null) =>
                        categories.find((c) => c.id === value)?.name ??
                        "Selecione a categoria"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.categoryId]} />
              </Field>

              {attributeFields.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {attributeFields.map((field) => (
                    <Field key={field.key}>
                      <FieldLabel htmlFor={field.key}>{field.label}</FieldLabel>
                      {field.type === "select" ? (
                        <Select
                          value={String(attributes[field.key] ?? "")}
                          onValueChange={(v) =>
                            setAttributes((prev) => ({ ...prev, [field.key]: v ?? "" }))
                          }
                        >
                          <SelectTrigger id={field.key} className="w-full">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {(field.options ?? []).map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={field.key}
                          type={field.type === "number" ? "number" : "text"}
                          value={attributes[field.key] ?? ""}
                          onChange={(e) =>
                            setAttributes((prev) => ({
                              ...prev,
                              [field.key]:
                                field.type === "number"
                                  ? Number(e.target.value)
                                  : e.target.value,
                            }))
                          }
                        />
                      )}
                    </Field>
                  ))}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="description">Descrição</FieldLabel>
                <Textarea
                  id="description"
                  rows={8}
                  placeholder="Conte o histórico da peça, estado de conservação, itens inclusos, motivo da venda..."
                  {...register("description")}
                />
                <FieldDescription>
                  Quanto mais detalhes, mais confiança você passa para o comprador.
                </FieldDescription>
                <FieldError errors={[errors.description]} />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <FieldLabel className="mb-3 block">Fotos do item</FieldLabel>
            <ImageUploader value={images} onChange={setImages} />
            {errors.images && (
              <p className="mt-2 text-sm text-destructive">
                {errors.images.message as string}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="condition">Estado de conservação</FieldLabel>
                <Select
                  value={watch("condition")}
                  onValueChange={(v) =>
                    setValue(
                      "condition",
                      (v ?? "GOOD") as ListingInput["condition"],
                      { shouldValidate: true }
                    )
                  }
                >
                  <SelectTrigger id="condition" className="w-full">
                    <SelectValue>
                      {(value: string | null) =>
                        CONDITION_LABELS[value ?? ""] ?? "Selecione"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="price">Preço (BRL)</FieldLabel>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min={0}
                  {...register("price", { valueAsNumber: true })}
                />
                <FieldError errors={[errors.price]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="quantity">Quantidade disponível</FieldLabel>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  {...register("quantity", { valueAsNumber: true })}
                />
                <FieldError errors={[errors.quantity]} />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          {listingId ? "Salvar alterações" : "Publicar anúncio"}
        </Button>
      </div>
    </form>
  );
}
