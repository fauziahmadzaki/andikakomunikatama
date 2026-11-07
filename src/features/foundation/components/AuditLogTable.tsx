"use client";

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import type { AuditLog } from "@/features/foundation/data/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  const columns: DataTableColumn<AuditLog>[] = [
    {
      key: "createdAt",
      header: "Waktu",
      cell: (log) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(log.createdAt)}
        </span>
      ),
    },
    {
      key: "action",
      header: "Aksi",
      cell: (log) => (
        <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">
          {log.action}
        </span>
      ),
    },
    {
      key: "entityId",
      header: "Entitas",
      cell: (log) => (
        <div>
          <p className="text-xs font-medium">{log.entityId}</p>
          <p className="text-[11px] text-muted-foreground">{log.entityType}</p>
        </div>
      ),
    },
    {
      key: "actor",
      header: "Aktor",
    },
    {
      key: "branch",
      header: "Cabang",
      cell: (log) => (
        <span className="text-muted-foreground">{log.branch}</span>
      ),
    },
    {
      key: "description",
      header: "Keterangan",
      cell: (log) => (
        <span className="max-w-[280px] truncate text-muted-foreground">
          {log.description}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={logs}
      columns={columns}
      getRowKey={(log) => log.id}
      ariaLabel="Audit log"
      emptyMessage="Tidak ada audit log yang cocok."
    />
  );
}
