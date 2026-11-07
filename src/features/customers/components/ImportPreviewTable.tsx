"use client";

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ImportRow } from "@/features/customers/data/types";

export function ImportPreviewTable({ rows }: { rows: ImportRow[] }) {
  const columns: DataTableColumn<ImportRow>[] = [
    { key: "row", header: "Baris" },
    {
      key: "name",
      header: "Nama",
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "phone",
      header: "Telepon",
      cell: (row) => (
        <span className="text-muted-foreground">{row.phone}</span>
      ),
    },
    { key: "branchName", header: "Cabang" },
    { key: "planName", header: "Paket" },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge
          tone={
            row.status === "valid"
              ? "success"
              : row.status === "warning"
                ? "warning"
                : "danger"
          }
        >
          {row.status}
        </StatusBadge>
      ),
    },
    {
      key: "message",
      header: "Catatan",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">{row.message}</span>
      ),
    },
  ];

  return (
    <DataTable
      data={rows}
      columns={columns}
      getRowKey={(row) => String(row.row)}
      ariaLabel="Preview import pelanggan"
      emptyMessage="Belum ada baris untuk dipreview."
    />
  );
}
