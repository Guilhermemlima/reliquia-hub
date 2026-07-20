"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { createStore } from "@/modules/affiliate/actions";
import type { StoreInput } from "@/modules/affiliate/schema";

type FormValues = {
  name: string;
  logoUrl: string;
  websiteUrl: string;
  allowedDomains: string;
};

export function StoreFormDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: "", logoUrl: "", websiteUrl: "", allowedDomains: "" },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const payload: StoreInput = {
      name: values.name,
      logoUrl: values.logoUrl,
      websiteUrl: values.websiteUrl,
      allowedDomains: values.allowedDomains
        .split(/[\n,]/)
        .map((d) => d.trim())
        .filter(Boolean),
    };
    const result = await createStore(payload);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Loja cadastrada!");
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus /> Nova loja
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova loja parceira</DialogTitle>
          <DialogDescription>
            Cadastre a loja antes de criar um programa de afiliados ou uma
            oferta manual para ela.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nome da loja</FieldLabel>
              <Input id="name" placeholder="Ex: KaBuM" {...register("name", { required: true })} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="websiteUrl">Site (opcional)</FieldLabel>
              <Input id="websiteUrl" placeholder="https://www.kabum.com.br" {...register("websiteUrl")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="logoUrl">Logo (URL, opcional)</FieldLabel>
              <Input id="logoUrl" placeholder="https://..." {...register("logoUrl")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="allowedDomains">Domínios permitidos</FieldLabel>
              <Textarea
                id="allowedDomains"
                rows={3}
                placeholder={"kabum.com.br\nwww.kabum.com.br"}
                {...register("allowedDomains", { required: true })}
              />
              <FieldDescription>
                Um domínio por linha (ou separados por vírgula). Só URLs
                desses domínios poderão virar ofertas desta loja.
              </FieldDescription>
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={loading}>
              Salvar loja
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
