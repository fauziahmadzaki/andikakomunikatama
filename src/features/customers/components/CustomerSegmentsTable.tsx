"use client";

import { Trash2Icon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import type { CustomerSegment } from "@/features/customers/data/types";

export function CustomerSegmentsTable({
  segments,
  onDelete,
}: {
  segments: CustomerSegment[];
  onDelete: (segment: CustomerSegment) => void;
}) {
  const columns: DataTableColumn<CustomerSegment>[] = [
    {
      key: "name",
      header: "Segmen",
      cell: (segment) => (
        <div>
          <p className="font-medium">{segment.name}</p>
          <p className="text-xs text-muted-foreground">{segment.description}</p>
        </div>
      ),
    },
    {
      key: "filterLabel",
      header: "Filter",
      cell: (segment) => (
        <span className="font-mono text-xs text-muted-foreground">
          {segment.filterLabel}
        </span>
      ),
    },
    {
      key: "count",
      header: "Pelanggan",
      cell: (segment) => `${segment.count} pelanggan`,
    },
    {
      key: "createdAt",
      header: "Dibuat",
      cell: (segment) => (
        <span className="text-muted-foreground">{segment.createdAt}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (segment) => (
        <ActionIconButton
          icon={Trash2Icon}
          label="Hapus segmen"
          tone="destructive"
          onPress={() => onDelete(segment)}
        />
      ),
    },
  ];

  return (
    <DataTable
      data={segments}
      columns={columns}
      getRowKey={(segment) => segment.id}
      ariaLabel="Daftar segmen pelanggan"
      emptyMessage="Belum ada segmen."
    />
  );
}
