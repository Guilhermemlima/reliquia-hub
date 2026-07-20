"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Flag } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createReport } from "@/modules/reports/actions";
import {
  reportReasons,
  REPORT_REASON_LABELS,
  type ReportInput,
} from "@/modules/reports/schema";

export function ReportDialog({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportInput["reason"]>("OTHER");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    const result = await createReport({ listingId, reason, details });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Denúncia enviada. Nossa equipe vai revisar.");
    setOpen(false);
    setDetails("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="text-muted-foreground" />
        }
      >
        <Flag className="size-3.5" /> Denunciar anúncio
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Denunciar anúncio</DialogTitle>
          <DialogDescription>
            Ajude a manter o Relíquia Hub seguro para todos os colecionadores.
          </DialogDescription>
        </DialogHeader>

        <Select value={reason} onValueChange={(v) => v && setReason(v as ReportInput["reason"]) }>
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: ReportInput["reason"] | null) =>
                REPORT_REASON_LABELS[value ?? "OTHER"]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {reportReasons.map((value) => (
              <SelectItem key={value} value={value}>
                {REPORT_REASON_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Textarea
          placeholder="Descreva o problema (opcional)"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={4}
        />

        <DialogFooter>
          <Button onClick={onSubmit} disabled={loading} variant="destructive">
            Enviar denúncia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
