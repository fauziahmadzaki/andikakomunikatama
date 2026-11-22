"use client";

import { ArrowRightLeftIcon, Undo2Icon, WrenchIcon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBranchStore } from "@/features/branches/store/branch-store";
import type {
  InventoryItem,
  InventoryMovement,
} from "@/features/network/data/types";
import { useUsersStore } from "@/features/users/store/users-store";
import { formatDate, formatRupiah } from "@/lib/format";

export function InventoryTable({
  items,
  onInstall,
  onReturn,
  onMove,
}: {
  items: InventoryItem[];
  onInstall: (item: InventoryItem) => void;
  onReturn: (item: InventoryItem) => void;
  onMove: (item: InventoryItem) => void;
}) {
  const branches = useBranchStore((state) => state.branches);

  const columns: DataTableColumn<InventoryItem>[] = [
    {
      key: "name",
      header: "Barang",
      cell: (item) => (
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {item.sku} · {item.serialNumber}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Kategori",
      cell: (item) => (
        <StatusBadge tone="primary">{item.category}</StatusBadge>
      ),
    },
    {
      key: "branchId",
      header: "Cabang",
      cell: (item) => (
        <span className="text-muted-foreground">
          {branches.find((branch) => branch.id === item.branchId)?.name ?? "-"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item) => (
        <StatusBadge
          tone={
            item.status === "in_stock"
              ? "success"
              : item.status === "installed"
                ? "primary"
                : item.status === "damaged"
                  ? "danger"
                  : "neutral"
          }
        >
          {item.status}
        </StatusBadge>
      ),
    },
    {
      key: "purchasePrice",
      header: "Nilai",
      cell: (item) => formatRupiah(item.currentValue ?? item.purchasePrice),
    },
    {
      key: "purchasedAt",
      header: "Dibeli",
      cell: (item) => (
        <span className="text-muted-foreground">
          {formatDate(item.purchasedAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (item) => (
        <div className="flex justify-end gap-1">
          {item.status === "in_stock" ? (
            <ActionIconButton
              icon={WrenchIcon}
              label="Tandai terpasang"
              onPress={() => onInstall(item)}
            />
          ) : null}
          {item.status === "installed" ? (
            <ActionIconButton
              icon={Undo2Icon}
              label="Tandai dikembalikan"
              onPress={() => onReturn(item)}
            />
          ) : null}
          <ActionIconButton
            icon={ArrowRightLeftIcon}
            label="Catat movement"
            onPress={() => onMove(item)}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={items}
      columns={columns}
      getRowKey={(item) => item.id}
      ariaLabel="Daftar inventaris"
      emptyMessage="Belum ada inventaris."
    />
  );
}

export function MovementTable({
  movements,
}: {
  movements: InventoryMovement[];
}) {
  const branches = useBranchStore((state) => state.branches);
  const employees = useUsersStore((state) => state.employees);

  const columns: DataTableColumn<InventoryMovement>[] = [
    {
      key: "type",
      header: "Tipe",
      cell: (movement) => (
        <StatusBadge tone="primary">{movement.type}</StatusBadge>
      ),
    },
    { key: "reference", header: "Referensi" },
    {
      key: "fromBranchId",
      header: "Dari",
      cell: (movement) =>
        branches.find((branch) => branch.id === movement.fromBranchId)?.name ??
        "-",
    },
    {
      key: "toBranchId",
      header: "Ke",
      cell: (movement) =>
        branches.find((branch) => branch.id === movement.toBranchId)?.name ??
        "-",
    },
    {
      key: "employeeId",
      header: "Petugas",
      cell: (movement) =>
        employees.find((employee) => employee.id === movement.employeeId)
          ?.fullName ?? "-",
    },
    {
      key: "occurredAt",
      header: "Waktu",
      cell: (movement) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(movement.occurredAt)}
        </span>
      ),
    },
    {
      key: "notes",
      header: "Catatan",
      cell: (movement) => (
        <span className="text-xs text-muted-foreground">{movement.notes}</span>
      ),
    },
  ];

  return (
    <DataTable
      data={movements}
      columns={columns}
      getRowKey={(movement) => movement.id}
      ariaLabel="Riwayat movement inventaris"
      emptyMessage="Belum ada movement."
    />
  );
}
