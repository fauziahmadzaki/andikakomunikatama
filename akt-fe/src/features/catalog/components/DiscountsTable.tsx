"use client";

import { BanIcon, CheckCircleIcon, PencilIcon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Discount } from "@/features/catalog/data/types";
import { formatDate, formatRupiah } from "@/lib/format";

export function DiscountsTable({
  discounts,
  scopeLabel,
  onEdit,
  onToggle,
}: {
  discounts: Discount[];
  scopeLabel: (discountId: string) => string;
  onEdit: (discount: Discount) => void;
  onToggle: (discount: Discount) => void;
}) {
  const columns: DataTableColumn<Discount>[] = [
    {
      key: "code",
      header: "Diskon",
      cell: (discount) => (
        <div>
          <p className="font-medium">{discount.name}</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {discount.code}
          </p>
        </div>
      ),
    },
    {
      key: "value",
      header: "Nilai",
      cell: (discount) =>
        discount.method === "percentage"
          ? `${discount.value}%`
          : formatRupiah(discount.value),
    },
    {
      key: "scope",
      header: "Cakupan",
      cell: (discount) => (
        <span className="text-muted-foreground">
          {scopeLabel(discount.id)}
        </span>
      ),
    },
    {
      key: "period",
      header: "Periode",
      cell: (discount) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(discount.startsAt)} – {formatDate(discount.endsAt)}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      cell: (discount) => (
        <StatusBadge tone={discount.isActive ? "success" : "neutral"}>
          {discount.isActive ? "Aktif" : "Nonaktif"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (discount) => (
        <div className="flex justify-end gap-1">
          <ActionIconButton
            icon={PencilIcon}
            label="Edit diskon"
            onPress={() => onEdit(discount)}
          />
          <ActionIconButton
            icon={discount.isActive ? BanIcon : CheckCircleIcon}
            label={discount.isActive ? "Nonaktifkan diskon" : "Aktifkan diskon"}
            tone={discount.isActive ? "destructive" : "default"}
            onPress={() => onToggle(discount)}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={discounts}
      columns={columns}
      getRowKey={(discount) => discount.id}
      ariaLabel="Daftar diskon"
      emptyMessage="Belum ada diskon."
    />
  );
}
