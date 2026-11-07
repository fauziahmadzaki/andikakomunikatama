"use client";

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import type { CustomerInvoice } from "@/features/customers/data/types";

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function CustomerBillingTab({
  invoices,
}: {
  invoices: CustomerInvoice[];
}) {
  const columns: DataTableColumn<CustomerInvoice>[] = [
    {
      key: "number",
      header: "Invoice",
      cell: (invoice) => (
        <span className="font-mono text-xs">{invoice.number}</span>
      ),
    },
    {
      key: "period",
      header: "Periode",
    },
    {
      key: "dueDate",
      header: "Jatuh tempo",
      cell: (invoice) => (
        <span className="text-muted-foreground">{invoice.dueDate}</span>
      ),
    },
    {
      key: "total",
      header: "Total",
      cell: (invoice) => rupiah(invoice.total),
    },
    {
      key: "status",
      header: "Status",
      cell: (invoice) => (
        <StatusBadge
          tone={
            invoice.status === "paid"
              ? "success"
              : invoice.status === "overdue"
                ? "danger"
                : "warning"
          }
        >
          {invoice.status}
        </StatusBadge>
      ),
    },
  ];

  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-4">
        <DataTable
          data={invoices}
          columns={columns}
          getRowKey={(invoice) => invoice.id}
          ariaLabel="Tagihan pelanggan"
          emptyMessage="Belum ada tagihan."
        />
      </CardContent>
    </Card>
  );
}
