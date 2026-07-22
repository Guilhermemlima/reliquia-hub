"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Link2 } from "lucide-react";
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

type StoreOption = { id: string; name: string };

type FormValues = {
  storeId: string;
  affiliateUrl: string;
  condition: (typeof offerConditions)[number];
  availability: (typeof offerAvailabilities)[number];
};

export function PartOfferDialog({
  partId,
  partName,
  stores,
  offerCount,
}: {
  partId: string;
  partName: string;
  stores: StoreOption[];
  offerCount: number;
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
      storeId: "",
      affiliateUrl: "",
      condition: "NEW",
      availability: "IN_STOCK",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!values.storeId) {
      toast.error("Selecione a loja.");
      return;
    }
    setLoading(true);
    const result = await createOffer({
      partId,
      storeId: values.storeId,
      affiliateUrl: values.affiliateUrl,
      condition: values.condition,
      availability: values.availability,
    });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Link associado! O preço aparece após a próxima atualização em lote.");
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={offerCount > 0 ? "outline" : "default"} size="sm" />}>
        <Link2 className="size-3.5" /> {offerCount > 0 ? "Adicionar link" : "Associar link"}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Associar link — {partName}</DialogTitle>
          <DialogDescription>
            Cole apenas o link de afiliado já pronto (ex: gerado no SiteStripe da
            Amazon). O preço é detectado automaticamente pelo botão &quot;Atualizar
            preços&quot; — não precisa digitar aqui.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="partOfferStore">Loja</FieldLabel>
              <Select value={watch("storeId")} onValueChange={(v) => setValue("storeId", v ?? "")}>
                <SelectTrigger id="partOfferStore" className="w-full">
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
              <FieldLabel htmlFor="partOfferAffUrl">Link de afiliado</FieldLabel>
              <Input
                id="partOfferAffUrl"
                placeholder="https://amzn.to/..."
                {...register("affiliateUrl", { required: true })}
              />
              <FieldError errors={[errors.affiliateUrl]} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="partOfferCondition">Condição</FieldLabel>
                <Select
                  value={watch("condition")}
                  onValueChange={(v) =>
                    setValue("condition", (v ?? "NEW") as FormValues["condition"])
                  }
                >
                  <SelectTrigger id="partOfferCondition" className="w-full">
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
                <FieldLabel htmlFor="partOfferAvailability">Estoque</FieldLabel>
                <Select
                  value={watch("availability")}
                  onValueChange={(v) =>
                    setValue("availability", (v ?? "IN_STOCK") as FormValues["availability"])
                  }
                >
                  <SelectTrigger id="partOfferAvailability" className="w-full">
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
              Salvar link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
