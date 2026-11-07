"use client";

import { PencilIcon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import type { NumberSequence } from "@/features/foundation/data/types";

function preview(sequence: NumberSequence) {
  return `${sequence.prefix}-2026-${String(sequence.nextNumber).padStart(
    sequence.padding,
    "0"
  )}`;
}

export function SequencesTable({
  sequences,
  onEdit,
}: {
  sequences: NumberSequence[];
  onEdit: (sequence: NumberSequence) => void;
}) {
  const columns: DataTableColumn<NumberSequence>[] = [
    {
      key: "label",
      header: "Dokumen",
      cell: (sequence) => <span className="font-medium">{sequence.label}</span>,
    },
    {
      key: "prefix",
      header: "Prefix",
      cell: (sequence) => (
        <span className="font-mono text-xs">{sequence.prefix}</span>
      ),
    },
    {
      key: "nextNumber",
      header: "Nomor berikutnya",
    },
    {
      key: "preview",
      header: "Contoh",
      cell: (sequence) => (
        <span className="font-mono text-xs text-muted-foreground">
          {preview(sequence)}
        </span>
      ),
    },
    {
      key: "resetPolicy",
      header: "Reset",
      cell: (sequence) => (
        <span className="capitalize text-muted-foreground">
          {sequence.resetPolicy}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (sequence) => (
        <ActionIconButton
          icon={PencilIcon}
          label="Edit penomoran"
          onPress={() => onEdit(sequence)}
        />
      ),
    },
  ];

  return (
    <DataTable
      data={sequences}
      columns={columns}
      getRowKey={(sequence) => sequence.id}
      ariaLabel="Daftar penomoran"
      emptyMessage="Belum ada penomoran."
    />
  );
}
