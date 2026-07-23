"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { createOffer } from "@/modules/affiliate/actions";
import { offerConditions, offerAvailabilities } from "@/modules/affiliate/schema";
import { PART_CATEGORY_LABELS } from "@/modules/parts/queries";

const CONDITION_LABELS: Record<string, string> = {
  NEW: "Novo",
  USED: "Usado",
  REFURBISHED: "Recondicionado",
};

const AVAILABILITY_LABELS: Record<string, string> = {
  IN_STOCK: "Em estoque",
  OUT_OF_STOCK: "Sem estoque",
  UNKNOWN: "Desconhecido",
};

type PartOption = { id: string; name: string; category: string };
type StoreOption = { id: string; name: string };

type FormValues = {
  partId: string;
  storeId: string;
  affiliateUrl: string;
  normalPrice: string;
  condition: (typeof offerConditions)[number];
  availability: (typeof offerAvailabilities)[number];
};

export function OfferFormDialog({
  parts,
  stores,
}: {
  parts: PartOption[];
  stores: StoreOption[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      partId: "",
      storeId: "",
      affiliateUrl: "",
      normalPrice: "",
      condition: "NEW",
      availability: "IN_STOCK",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!values.partId || !values.storeId) {
      toast.error("Selecione a peça e a loja.");
      return;
    }
    setLoading(true);
    const result = await createOffer({
      partId: values.partId,
      storeId: values.storeId,
      affiliateUrl: values.affiliateUrl,
      normalPrice: values.normalPrice ? Number(values.normalPrice) : undefined,
      condition: values.condition,
      availability: values.availability,
    });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(
      values.normalPrice
        ? "Oferta cadastrada com preço — já aparece no montador."
        : "Oferta cadastrada! Preencha o preço depois ou espere a atualização automática (nem sempre funciona pra Amazon)."
    );
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus /> Nova oferta manual
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova oferta manual</DialogTitle>
          <DialogDescription>
            Cole o link de afiliado já pronto. O preço é opcional — o botão
            &quot;Atualizar preços&quot; tenta buscar sozinho, mas a Amazon bloqueia
            essa busca automática, então pra links da Amazon vale preencher aqui.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="offerPart">Peça</FieldLabel>
              <Select value={watch("partId")} onValueChange={(v) => setValue("partId", v ?? "")}>
                <SelectTrigger id="offerPart" className="w-full">
                  <SelectValue>
                    {(value: string | null) =>
                      parts.find((p) => p.id === value)?.name ?? "Selecione a peça"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {parts.map((part) => (
                    <SelectItem key={part.id} value={part.id}>
                      {PART_CATEGORY_LABELS[part.category] ?? part.category} — {part.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="offerStore">Loja</FieldLabel>
              <Select value={watch("storeId")} onValueChange={(v) => setValue("storeId", v ?? "")}>
                <SelectTrigger id="offerStore" className="w-full">
                  <SelectValue>
                    {(value: string | null) =>
                      stores.find((s) => s.id === value)?.name ?? "Selecione a loja"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="offerAffUrl">Link de afiliado</FieldLabel>
              <Input
                id="offerAffUrl"
                placeholder="https://amzn.to/..."
                {...register("affiliateUrl", { required: true })}
              />
              <FieldError errors={[errors.affiliateUrl]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="offerNormalPrice">Preço (opcional)</FieldLabel>
              <Input
                id="offerNormalPrice"
                type="number"
                step="0.01"
                placeholder="Ex: 249.90"
                {...register("normalPrice")}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="condition">Condição</FieldLabel>
                <Select
                  value={watch("condition")}
                  onValueChange={(v) =>
                    setValue("condition", (v ?? "NEW") as FormValues["condition"])
                  }
                >
                  <SelectTrigger id="condition" className="w-full">
                    <SelectValue>
                      {(value: string | null) => CONDITION_LABELS[value ?? "NEW"]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {offerConditions.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CONDITION_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="availability">Estoque</FieldLabel>
                <Select
                  value={watch("availability")}
                  onValueChange={(v) =>
                    setValue("availability", (v ?? "IN_STOCK") as FormValues["availability"])
                  }
                >
                  <SelectTrigger id="availability" className="w-full">
                    <SelectValue>
                      {(value: string | null) => AVAILABILITY_LABELS[value ?? "IN_STOCK"]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {offerAvailabilities.map((a) => (
                      <SelectItem key={a} value={a}>
                        {AVAILABILITY_LABELS[a]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={loading}>
              Salvar oferta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
