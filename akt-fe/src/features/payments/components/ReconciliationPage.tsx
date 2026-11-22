"use client";

import { ArrowLeftIcon, CheckIcon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ReconciliationRow } from "@/features/payments/data/types";
import { useReconciliationPage } from "@/features/payments/hooks/usePayments";
import { formatRupiah } from "@/lib/format";

export function ReconciliationPage() {
  const { rows, resolve } = useReconciliationPage();

  const columns: DataTableColumn<ReconciliationRow>[] = [
    {
      key: "reference",
      header: "Referensi",
      cell: (row) => (
        <span className="font-mono text-xs">{row.reference}</span>
      ),
    },
    {
      key: "amount",
      header: "Nominal",
      cell: (row) => formatRupiah(row.amount),
    },
    {
      key: "source",
      header: "Sumber",
      cell: (row) => row.source,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge
          tone={
            row.status === "matched"
              ? "success"
              : row.status === "resolved"
                ? "primary"
                : "warning"
          }
        >
          {row.status}
        </StatusBadge>
      ),
    },
    {
      key: "note",
      header: "Catatan",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">{row.note}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (row) =>
        row.status === "unmatched" ? (
          <ActionIconButton
            icon={CheckIcon}
            label="Selesaikan rekonsiliasi"
            onPress={() => resolve(row.id)}
          />
        ) : null,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-3">
        <LinkButton
          href="/dashboard/pembayaran"
          variant="ghost"
          size="sm"
          className="-ml-2"
        >
          <ArrowLeftIcon />
          Kembali ke pembayaran
        </LinkButton>
        <PageHeader
          title="Rekonsiliasi"
          description="Cocokkan transaksi bank/gateway dengan pembayaran."
        />
      </div>

      <Card className="gap-0 py-0">
        <CardContent className="p-4">
          <DataTable
            data={rows}
            columns={columns}
            getRowKey={(row) => row.id}
            ariaLabel="Rekonsiliasi pembayaran"
            emptyMessage="Tidak ada transaksi untuk direkonsiliasi."
          />
        </CardContent>
      </Card>
    </div>
  );
}
