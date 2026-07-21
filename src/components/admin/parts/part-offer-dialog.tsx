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
  sellerName: string;
  normalPrice: string;
  pixPrice: string;
  shippingPrice: string;
  originalUrl: string;
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
      sellerName: "",
      normalPrice: "",
      pixPrice: "",
      shippingPrice: "",
      originalUrl: "",
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
      sellerName: values.sellerName || undefined,
      normalPrice: Number(values.normalPrice),
      pixPrice: values.pixPrice ? Number(values.pixPrice) : undefined,
      shippingPrice: values.shippingPrice ? Number(values.shippingPrice) : undefined,
      originalUrl: values.originalUrl,
      affiliateUrl: values.affiliateUrl || undefined,
      condition: values.condition,
      availability: values.availability,
    });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Link associado!");
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
            A URL precisa ser de um domínio autorizado da loja escolhida.
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

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="partOfferPrice">Preço</FieldLabel>
                <Input id="partOfferPrice" type="number" step="0.01" {...register("normalPrice", { required: true })} />
                <FieldError errors={[errors.normalPrice]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="partOfferPixPrice">Preço no Pix</FieldLabel>
                <Input id="partOfferPixPrice" type="number" step="0.01" {...register("pixPrice")} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="partOfferShipping">Frete (opcional, 0 = grátis)</FieldLabel>
              <Input id="partOfferShipping" type="number" step="0.01" {...register("shippingPrice")} />
            </Field>

            <Field>
              <FieldLabel htmlFor="partOfferUrl">URL original do produto</FieldLabel>
              <Input id="partOfferUrl" placeholder="https://..." {...register("originalUrl", { required: true })} />
              <FieldError errors={[errors.originalUrl]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="partOfferAffUrl">URL de afiliado (se já tiver)</FieldLabel>
              <Input id="partOfferAffUrl" placeholder="https://... (opcional)" {...register("affiliateUrl")} />
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

            <Field>
              <FieldLabel htmlFor="partOfferSeller">Vendedor (opcional)</FieldLabel>
              <Input id="partOfferSeller" {...register("sellerName")} />
            </Field>
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
