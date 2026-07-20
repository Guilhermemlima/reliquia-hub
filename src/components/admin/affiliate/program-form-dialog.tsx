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
import { createProgram } from "@/modules/affiliate/actions";
import { programProviderTypes, type ProgramInput } from "@/modules/affiliate/schema";

const PROVIDER_LABELS: Record<(typeof programProviderTypes)[number], string> = {
  MANUAL: "Manual (link colado pelo admin)",
  API: "API oficial",
  FEED: "Feed (XML/CSV/JSON)",
  LINK_BUILDER: "Link builder da rede",
  URL_TEMPLATE: "Modelo de URL autorizado",
  CSV: "Importação CSV",
  DISABLED: "Desativado",
};

type FormValues = {
  name: string;
  storeId: string;
  providerType: ProgramInput["providerType"];
  affiliateIdentifier: string;
};

export function ProgramFormDialog({
  stores,
}: {
  stores: { id: string; name: string }[];
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
    defaultValues: { name: "", storeId: "", providerType: "MANUAL", affiliateIdentifier: "" },
  });

  async function onSubmit(values: FormValues) {
    if (!values.storeId) {
      toast.error("Selecione uma loja.");
      return;
    }
    setLoading(true);
    const result = await createProgram(values);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Programa criado!");
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Plus /> Novo programa
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo programa de afiliados</DialogTitle>
          <DialogDescription>
            Só o tipo &ldquo;Manual&rdquo; está implementado nesta fase — os
            demais ficam reservados para quando houver credencial real da rede.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="programStore">Loja</FieldLabel>
              <Select
                value={watch("storeId")}
                onValueChange={(v) => setValue("storeId", v ?? "")}
              >
                <SelectTrigger id="programStore" className="w-full">
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
              <FieldLabel htmlFor="programName">Nome do programa</FieldLabel>
              <Input id="programName" placeholder="Ex: KaBuM Afiliados" {...register("name", { required: true })} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="providerType">Tipo de integração</FieldLabel>
              <Select
                value={watch("providerType")}
                onValueChange={(v) =>
                  setValue("providerType", (v ?? "MANUAL") as ProgramInput["providerType"])
                }
              >
                <SelectTrigger id="providerType" className="w-full">
                  <SelectValue>
                    {(value: string | null) =>
                      PROVIDER_LABELS[(value ?? "MANUAL") as keyof typeof PROVIDER_LABELS]
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {programProviderTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {PROVIDER_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="affiliateIdentifier">
                Identificador de afiliado (público, opcional)
              </FieldLabel>
              <Input
                id="affiliateIdentifier"
                placeholder="Ex: tracking id"
                {...register("affiliateIdentifier")}
              />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={loading}>
              Salvar programa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
