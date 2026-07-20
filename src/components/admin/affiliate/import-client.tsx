"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  OFFER_CSV_HEADERS,
  offerCsvTemplate,
  parseCsv,
  csvRowsToOfferRows,
  type OfferCsvRow,
} from "@/modules/affiliate/csv";
import { importOffersCsv, type ImportSummary } from "@/modules/affiliate/import-actions";

const PREVIEW_LIMIT = 10;

export function ImportClient() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<OfferCsvRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  function downloadTemplate() {
    const blob = new Blob([offerCsvTemplate()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo-ofertas.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setSummary(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const parsed = csvRowsToOfferRows(parseCsv(text));
      if (parsed.error) {
        setParseError(parsed.error);
        setRows([]);
      } else {
        setParseError(null);
        setRows(parsed.rows);
      }
    };
    reader.readAsText(file, "utf-8");
  }

  async function onImport() {
    setLoading(true);
    const result = await importOffersCsv(rows);
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setSummary(result);
    toast.success(
      `${result.created} ofertas criadas, ${result.duplicates} já existentes, ${result.errors} com erro.`
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm text-muted-foreground">
            Envie um CSV com as colunas:{" "}
            <code className="text-xs">{OFFER_CSV_HEADERS.join(", ")}</code>.
            Peça e loja são identificadas pelo <code>slug</code>.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download /> Baixar modelo CSV
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload /> Selecionar arquivo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={onFileChange}
            />
            {fileName && <Badge variant="secondary">{fileName}</Badge>}
          </div>
          {parseError && <p className="text-sm text-destructive">{parseError}</p>}
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">
                Prévia ({rows.length} linhas)
              </h2>
              <Button onClick={onImport} disabled={loading}>
                {loading && <Loader2 className="animate-spin" />}
                Importar {rows.length} ofertas
              </Button>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Peça</TableHead>
                    <TableHead>Loja</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, PREVIEW_LIMIT).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.part_slug || row.part_title || "(associação automática)"}</TableCell>
                      <TableCell>{row.store_slug}</TableCell>
                      <TableCell>{row.price}</TableCell>
                      <TableCell className="max-w-xs truncate">{row.original_url}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {rows.length > PREVIEW_LIMIT && (
              <p className="mt-2 text-xs text-muted-foreground">
                Mostrando {PREVIEW_LIMIT} de {rows.length} linhas.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {summary && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-3 font-heading text-lg font-semibold">Resultado</h2>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xl font-semibold">{summary.total}</p>
                <p className="text-xs text-muted-foreground">Processadas</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xl font-semibold text-success">{summary.created}</p>
                <p className="text-xs text-muted-foreground">Criadas</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xl font-semibold">{summary.duplicates}</p>
                <p className="text-xs text-muted-foreground">Já existentes</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xl font-semibold text-primary">{summary.pendingReview}</p>
                <p className="text-xs text-muted-foreground">Para revisão</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xl font-semibold text-destructive">{summary.errors}</p>
                <p className="text-xs text-muted-foreground">Com erro</p>
              </div>
            </div>
            {summary.pendingReview > 0 && (
              <p className="mb-3 text-sm text-muted-foreground">
                {summary.pendingReview} linha(s) foram associadas com confiança
                média — confira em{" "}
                <Link href="/admin/afiliados/revisao" className="text-primary underline">
                  Revisão de associações
                </Link>
                .
              </p>
            )}
            <div className="max-h-80 space-y-1 overflow-y-auto">
              {summary.results
                .filter((r) => r.status !== "created")
                .map((r) => (
                  <div key={r.row} className="flex items-center gap-2 text-sm">
                    <Badge variant={r.status === "error" ? "destructive" : "secondary"}>
                      Linha {r.row}
                    </Badge>
                    <span className="text-muted-foreground">{r.message}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
