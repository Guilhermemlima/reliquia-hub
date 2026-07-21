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
import { createPart } from "@/modules/parts/actions";
import { partCategories } from "@/modules/parts/schema";
import { PART_CATEGORY_LABELS } from "@/modules/parts/queries";

type FormValues = {
  category: (typeof partCategories)[number];
  brand: string;
  model: string;
  name: string;
  ean: string;
  mpn: string;
  imageUrl: string;
};

export function NewPartDialog() {
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
      category: "PERIPHERAL",
      brand: "",
      model: "",
      name: "",
      ean: "",
      mpn: "",
      imageUrl: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const result = await createPart({
      category: values.category,
      brand: values.brand,
      model: values.model,
      name: values.name,
      ean: values.ean || undefined,
      mpn: values.mpn || undefined,
      imageUrl: values.imageUrl || undefined,
    });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Peça criada — agora é só associar um link.");
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus /> Nova peça
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova peça</DialogTitle>
          <DialogDescription>
            Use pra lançamentos ou produtos que ainda não estão no catálogo importado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="newPartCategory">Categoria</FieldLabel>
              <Select
                value={watch("category")}
                onValueChange={(v) =>
                  setValue("category", (v ?? "PERIPHERAL") as FormValues["category"])
                }
              >
                <SelectTrigger id="newPartCategory" className="w-full">
                  <SelectValue>
                    {(value: string | null) => PART_CATEGORY_LABELS[value ?? "PERIPHERAL"]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {partCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {PART_CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="newPartName">Nome do produto</FieldLabel>
              <Input id="newPartName" {...register("name", { required: true })} />
              <FieldError errors={[errors.name]} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="newPartBrand">Marca</FieldLabel>
                <Input id="newPartBrand" {...register("brand", { required: true })} />
                <FieldError errors={[errors.brand]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="newPartModel">Modelo</FieldLabel>
                <Input id="newPartModel" {...register("model", { required: true })} />
                <FieldError errors={[errors.model]} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="newPartEan">EAN (opcional)</FieldLabel>
                <Input id="newPartEan" {...register("ean")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="newPartMpn">MPN (opcional)</FieldLabel>
                <Input id="newPartMpn" {...register("mpn")} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="newPartImage">URL da imagem (opcional)</FieldLabel>
              <Input id="newPartImage" placeholder="https://..." {...register("imageUrl")} />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={loading}>
              Criar peça
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
