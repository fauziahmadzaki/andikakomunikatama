"use client";

import { BanIcon, CheckCircleIcon, PencilIcon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Branch } from "@/features/foundation/data/types";

export function BranchesTable({
  branches,
  onEdit,
  onToggle,
}: {
  branches: Branch[];
  onEdit: (branch: Branch) => void;
  onToggle: (branch: Branch) => void;
}) {
  const columns: DataTableColumn<Branch>[] = [
    {
      key: "code",
      header: "Kode",
      cell: (branch) => (
        <span className="font-mono text-xs">{branch.code}</span>
      ),
    },
    {
      key: "name",
      header: "Nama cabang",
      cell: (branch) => (
        <div>
          <p className="font-medium">{branch.name}</p>
          <p className="text-xs text-muted-foreground">{branch.address}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Telepon",
      cell: (branch) => (
        <span className="text-muted-foreground">{branch.phone}</span>
      ),
    },
    {
      key: "customerCount",
      header: "Pelanggan",
    },
    {
      key: "status",
      header: "Status",
      cell: (branch) => (
        <div className="flex flex-wrap gap-1">
          <StatusBadge tone={branch.isActive ? "success" : "neutral"}>
            {branch.isActive ? "Aktif" : "Nonaktif"}
          </StatusBadge>
          {branch.isHeadOffice ? (
            <StatusBadge tone="primary">Pusat</StatusBadge>
          ) : null}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (branch) => (
        <div className="flex justify-end gap-1">
          <ActionIconButton
            icon={PencilIcon}
            label="Edit cabang"
            onPress={() => onEdit(branch)}
          />
          <ActionIconButton
            icon={branch.isActive ? BanIcon : CheckCircleIcon}
            label={branch.isActive ? "Nonaktifkan cabang" : "Aktifkan cabang"}
            tone={branch.isActive ? "destructive" : "default"}
            onPress={() => onToggle(branch)}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={branches}
      columns={columns}
      getRowKey={(branch) => branch.id}
      ariaLabel="Daftar cabang"
      emptyMessage="Belum ada cabang."
    />
  );
}
