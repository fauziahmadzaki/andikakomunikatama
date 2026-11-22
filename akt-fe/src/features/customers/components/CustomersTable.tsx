"use client";

import { BanIcon, CheckCircleIcon, EyeIcon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import {
  DataTable,
  type DataTableColumn,
  type DataTableSelection,
} from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { CustomerView } from "@/features/customers/data/types";
import {
  customerStatusLabel,
  customerStatusTone,
  formatRupiah,
} from "@/features/customers/data/status";

export function CustomersTable({
  customers,
  onView,
  onToggle,
  canToggle = true,
  selection,
}: {
  customers: CustomerView[];
  onView: (customer: CustomerView) => void;
  onToggle: (customer: CustomerView) => void;
  canToggle?: boolean;
  selection?: DataTableSelection;
}) {
  const columns: DataTableColumn<CustomerView>[] = [
    {
      key: "fullName",
      header: "Pelanggan",
      cell: (customer) => (
        <div>
          <p className="font-medium">{customer.fullName}</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {customer.customerNumber} · {customer.primaryPhone}
          </p>
        </div>
      ),
    },
    {
      key: "branchName",
      header: "Cabang",
      cell: (customer) => (
        <span className="text-muted-foreground">{customer.branchName}</span>
      ),
    },
    {
      key: "planName",
      header: "Paket",
      cell: (customer) => (
        <div>
          <p>{customer.planName}</p>
          <p className="text-xs text-muted-foreground">
            {formatRupiah(customer.monthlyFee)}/bln
          </p>
        </div>
      ),
    },
    {
      key: "mrr",
      header: "MRR",
      cell: (customer) => (
        <span className="font-medium">{formatRupiah(customer.mrr)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (customer) => (
        <StatusBadge tone={customerStatusTone[customer.status]}>
          {customerStatusLabel[customer.status]}
        </StatusBadge>
      ),
    },
    {
      key: "outstanding",
      header: "Outstanding",
      cell: (customer) => (
        <span
          className={
            customer.outstanding > 0
              ? "font-medium text-destructive"
              : "text-muted-foreground"
          }
        >
          {formatRupiah(customer.outstanding)}
        </span>
      ),
    },
    {
      key: "dueDay",
      header: "Jatuh tempo",
      cell: (customer) => (
        <span className="text-muted-foreground">
          {customer.dueDay ? `Tanggal ${customer.dueDay}` : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (customer) => (
        <div className="flex justify-end gap-1">
          <ActionIconButton
            icon={EyeIcon}
            label="Lihat detail pelanggan"
            onPress={() => onView(customer)}
          />
          {canToggle ? (
            <ActionIconButton
              icon={customer.status === "active" ? BanIcon : CheckCircleIcon}
              label={
                customer.status === "active"
                  ? "Isolir pelanggan"
                  : "Aktifkan pelanggan"
              }
              tone={customer.status === "active" ? "destructive" : "default"}
              onPress={() => onToggle(customer)}
            />
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={customers}
      columns={columns}
      getRowKey={(customer) => customer.id}
      ariaLabel="Daftar pelanggan"
      emptyMessage="Tidak ada pelanggan yang cocok dengan filter."
      selection={selection}
    />
  );
}
