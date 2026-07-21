"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ImageOff, Pencil } from "lucide-react";
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
import { updatePartImage } from "@/modules/parts/actions";

export function PartImageDialog({
  partId,
  partName,
  currentImageUrl,
}: {
  partId: string;
  partName: string;
  currentImageUrl: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(currentImageUrl ?? "");
  const [loading, setLoading] = useState(false);

  async function onSave() {
    setLoading(true);
    const result = await updatePartImage({ partId, imageUrl: url });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Imagem atualizada.");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="icon" aria-label={`Editar imagem de ${partName}`} />
        }
      >
        <Pencil className="size-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Imagem — {partName}</DialogTitle>
          <DialogDescription>
            Cole a URL de uma imagem pública do produto (ex: da própria loja ou de um
            servidor de imagens seu).
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageOff className="size-5 text-muted-foreground" />
            )}
          </div>
          <Field className="flex-1">
            <FieldLabel htmlFor="partImageUrl">URL da imagem</FieldLabel>
            <Input
              id="partImageUrl"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </Field>
        </div>
        <DialogFooter className="mt-2">
          <Button onClick={onSave} disabled={loading || !url}>
            Salvar imagem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
