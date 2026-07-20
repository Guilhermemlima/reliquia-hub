"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resolveReport } from "@/modules/admin/actions";
import { REPORT_REASON_LABELS } from "@/modules/reports/schema";
import { formatDate } from "@/lib/format";

export function ReportRow({
  report,
}: {
  report: {
    id: string;
    reason: string;
    details: string | null;
    status: string;
    createdAt: string;
    reporter: { name: string | null; email: string | null };
    listing: { title: string; slug: string } | null;
  };
}) {
  const [isPending, startTransition] = useTransition();

  function update(status: "RESOLVED" | "DISMISSED") {
    startTransition(async () => {
      const result = await resolveReport(report.id, status);
      if (result.error) toast.error(result.error);
      else toast.success("Denúncia atualizada.");
    });
  }

  return (
    <TableRow>
      <TableCell>
        {report.listing ? (
          <Link href={`/listings/${report.listing.slug}`} className="hover:underline">
            {report.listing.title}
          </Link>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        {REPORT_REASON_LABELS[report.reason as keyof typeof REPORT_REASON_LABELS] ??
          report.reason}
        {report.details && (
          <p className="max-w-xs truncate text-xs text-muted-foreground">
            {report.details}
          </p>
        )}
      </TableCell>
      <TableCell>{report.reporter.name ?? report.reporter.email}</TableCell>
      <TableCell>{formatDate(report.createdAt)}</TableCell>
      <TableCell>
        <Badge variant={report.status === "OPEN" ? "destructive" : "secondary"}>
          {report.status}
        </Badge>
      </TableCell>
      <TableCell className="space-x-2 text-right">
        {report.status === "OPEN" && (
          <>
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => update("RESOLVED")}
            >
              Resolver
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => update("DISMISSED")}
            >
              Descartar
            </Button>
          </>
        )}
      </TableCell>
    </TableRow>
  );
}
