"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { submitReview } from "@/modules/reviews/actions";

export function ReviewDialog({
  orderId,
  sellerName,
}: {
  orderId: string;
  sellerName: string;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    const result = await submitReview(orderId, { rating, comment });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Avaliação enviada. Obrigado!");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Avaliar compra
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Avaliar {sellerName}</DialogTitle>
          <DialogDescription>
            Conte como foi sua experiência com este vendedor.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-1 py-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} estrelas`}
            >
              <Star
                className={cn(
                  "size-7",
                  value <= rating
                    ? "fill-primary text-primary"
                    : "text-muted-foreground/40"
                )}
              />
            </button>
          ))}
        </div>

        <Textarea
          placeholder="Como foi a experiência? (opcional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />

        <DialogFooter>
          <Button onClick={onSubmit} disabled={loading}>
            Enviar avaliação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
