"use client";

import { BanIcon, CheckCircleIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Branch } from "@/features/branches/data/branches";

export function BranchesTable({
  branches,
  onEdit,
  onToggle,
  onDelete,
}: {
  branches: Branch[];
  onEdit: (branch: Branch) => void;
  onToggle: (branch: Branch) => void;
  onDelete?: (branch: Branch) => void;
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
          {onDelete ? (
            <ActionIconButton
              icon={Trash2Icon}
              label="Hapus cabang"
              tone="destructive"
              onPress={() => onDelete(branch)}
            />
          ) : null}
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
