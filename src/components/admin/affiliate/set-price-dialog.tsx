"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Tag } from "lucide-react";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { setOfferPrice } from "@/modules/affiliate/actions";

export function SetPriceDialog({ offerId, partName }: { offerId: string; partName: string }) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSave() {
    if (!price) {
      toast.error("Informe um preço.");
      return;
    }
    setLoading(true);
    const result = await setOfferPrice({ offerId, normalPrice: Number(price) });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Preço definido — já aparece no montador.");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Tag className="size-3.5" /> Definir preço
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Definir preço — {partName}</DialogTitle>
          <DialogDescription>
            A busca automática não achou o preço nesse link (comum na Amazon,
            que bloqueia esse tipo de acesso). Preencha manualmente.
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="setPriceInput">Preço</FieldLabel>
          <Input
            id="setPriceInput"
            type="number"
            step="0.01"
            placeholder="Ex: 249.90"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </Field>
        <DialogFooter className="mt-2">
          <Button onClick={onSave} disabled={loading}>
            Salvar preço
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
