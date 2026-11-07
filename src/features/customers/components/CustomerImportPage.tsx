"use client";

import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  DownloadIcon,
  FileSpreadsheetIcon,
  UploadIcon,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomerImport } from "@/features/customers/hooks/useCustomerImport";
import { ImportPreviewTable } from "./ImportPreviewTable";

export function CustomerImportPage() {
  const {
    step,
    fileName,
    setFileName,
    rows,
    imported,
    processFile,
    commit,
    reset,
    downloadTemplate,
    backToUpload,
  } = useCustomerImport();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        title="Impor pelanggan"
        description="Upload, validasi, lalu commit dalam satu alur."
      >
        <Button variant="outline" onPress={downloadTemplate}>
          <DownloadIcon />
          Template CSV
        </Button>
      </PageHeader>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {["Upload", "Preview", "Selesai"].map((label, index) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                step >= index + 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}
            </span>
            <span className={step >= index + 1 ? "text-foreground" : ""}>
              {label}
            </span>
            {index < 2 ? <span className="h-px w-8 bg-border" /> : null}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <Card className="gap-0 py-0">
          <CardContent className="p-6">
            <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center transition-colors hover:bg-muted/30">
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileSpreadsheetIcon className="size-6" />
              </span>
              <span className="space-y-1">
                <span className="block text-sm font-medium">
                  {fileName || "Pilih file CSV pelanggan"}
                </span>
                <span className="block text-xs text-muted-foreground">
                  Maksimal 5.000 baris. Format mengikuti template.
                </span>
              </span>
              <input
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(event) =>
                  setFileName(event.target.files?.[0]?.name ?? "")
                }
              />
            </label>

            <div className="mt-4 flex justify-end">
              <Button onPress={processFile} isDisabled={!fileName}>
                <UploadIcon />
                Proses file
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="gap-0 py-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle>Preview validasi</CardTitle>
            <p className="text-xs text-muted-foreground">
              {rows.length} baris ·{" "}
              {rows.filter((row) => row.status === "valid").length} valid ·{" "}
              {rows.filter((row) => row.status === "warning").length} warning ·{" "}
              {rows.filter((row) => row.status === "error").length} error
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <ImportPreviewTable rows={rows} />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
              <Button variant="outline" onPress={backToUpload}>
                <ArrowLeftIcon />
                Ganti file
              </Button>
              <Button onPress={commit}>
                Commit {rows.filter((row) => row.status !== "error").length} baris
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="gap-0 py-0">
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2Icon className="size-7" />
            </span>
            <div className="space-y-1">
              <p className="text-lg font-semibold">Import selesai</p>
              <p className="text-sm text-muted-foreground">
                {imported} pelanggan berhasil ditambahkan. Baris error dilewati.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <LinkButton href="/dashboard/pelanggan">
                Lihat pelanggan
              </LinkButton>
              <Button variant="outline" onPress={reset}>
                Import lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <p className="text-center text-xs text-muted-foreground">
        Butuh bantuan format?{" "}
        <Link href="/dashboard/pelanggan" className="text-primary hover:underline">
          Kembali ke daftar pelanggan
        </Link>
      </p>
    </div>
  );
}
