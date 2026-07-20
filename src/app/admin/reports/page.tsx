import type { Metadata } from "next";
import { getAllReports } from "@/modules/admin/queries";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportRow } from "@/components/admin/report-row";

export const metadata: Metadata = { title: "Denúncias · Admin" };

export default async function AdminReportsPage() {
  const reports = await getAllReports();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-semibold">Denúncias</h1>
      {reports.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma denúncia registrada.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Anúncio</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Denunciante</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <ReportRow
                  key={report.id}
                  report={{
                    id: report.id,
                    reason: report.reason,
                    details: report.details,
                    status: report.status,
                    createdAt: report.createdAt.toISOString(),
                    reporter: report.reporter,
                    listing: report.listing,
                  }}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
