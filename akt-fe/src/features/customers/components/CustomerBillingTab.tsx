"use client";

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  currentPeriod,
  formatPeriodLabel,
  periodsBetween,
} from "@/features/billing/data/period";
import {
  invoiceStatusLabel,
  invoiceStatusTone,
} from "@/features/billing/data/status";
import type { Invoice } from "@/features/billing/data/types";
import type { Subscription } from "@/features/subscriptions/data/types";
import { formatDate, formatRupiah } from "@/lib/format";

type BillingPeriodRow = {
  period: string;
  invoiceNumber: string;
  statusLabel: string;
  tone: StatusTone;
  total: number;
  paidAmount: number;
};

function buildPeriodRows(
  invoices: Invoice[],
  subscription?: Subscription
): BillingPeriodRow[] {
  const activeInvoices = invoices.filter(
    (invoice) => invoice.status !== "void"
  );
  const invoicePeriods = activeInvoices
    .map((invoice) => invoice.periodStart.slice(0, 7))
    .sort();
  const start =
    subscription?.startDate.slice(0, 7) ?? invoicePeriods[0] ?? "";
  const latestInvoiceEnd = activeInvoices
    .map((invoice) => invoice.periodEnd.slice(0, 7))
    .sort()
    .at(-1);
  const end = [currentPeriod(), latestInvoiceEnd]
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  if (!start || !end) {
    return [];
  }

  return periodsBetween(start, end).map((period) => {
    const invoice = activeInvoices.find(
      (item) =>
        item.periodStart.slice(0, 7) <= period &&
        item.periodEnd.slice(0, 7) >= period
    );

    if (!invoice) {
      return {
        period,
        invoiceNumber: "-",
        statusLabel: "Belum ditagih",
        tone: "neutral",
        total: 0,
        paidAmount: 0,
      };
    }

    const paid =
      invoice.status === "paid" || invoice.paidAmount >= invoice.total;
    const tone: StatusTone = paid
      ? "success"
      : invoice.status === "overdue"
        ? "danger"
        : invoice.status === "partial"
          ? "warning"
          : invoice.status === "draft"
            ? "neutral"
            : "warning";

    return {
      period,
      invoiceNumber: invoice.number,
      statusLabel: paid ? "Lunas" : "Belum lunas",
      tone,
      total: invoice.total,
      paidAmount: invoice.paidAmount,
    };
  });
}

export function CustomerBillingTab({
  invoices,
  subscription,
}: {
  invoices: Invoice[];
  subscription?: Subscription;
}) {
  const periodRows = buildPeriodRows(invoices, subscription);

  const periodColumns: DataTableColumn<BillingPeriodRow>[] = [
    {
      key: "period",
      header: "Periode",
      cell: (row) => formatPeriodLabel(row.period),
    },
    {
      key: "invoiceNumber",
      header: "Invoice",
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.invoiceNumber}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge tone={row.tone}>{row.statusLabel}</StatusBadge>
      ),
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      cell: (row) => formatRupiah(row.total),
    },
    {
      key: "paidAmount",
      header: "Terbayar",
      align: "right",
      cell: (row) => formatRupiah(row.paidAmount),
    },
  ];

  const invoiceColumns: DataTableColumn<Invoice>[] = [
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
      cell: (invoice) =>
        `${formatDate(invoice.periodStart)} – ${formatDate(invoice.periodEnd)}`,
    },
    {
      key: "dueDate",
      header: "Jatuh tempo",
      cell: (invoice) => (
        <span className="text-muted-foreground">
          {formatDate(invoice.dueDate)}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      cell: (invoice) => formatRupiah(invoice.total),
    },
    {
      key: "status",
      header: "Status",
      cell: (invoice) => (
        <StatusBadge tone={invoiceStatusTone[invoice.status]}>
          {invoiceStatusLabel[invoice.status]}
        </StatusBadge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Periode tagihan</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable
            data={periodRows}
            columns={periodColumns}
            getRowKey={(row) => row.period}
            ariaLabel="Status periode tagihan pelanggan"
            emptyMessage="Belum ada periode tagihan."
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Dokumen invoice</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable
            data={invoices}
            columns={invoiceColumns}
            getRowKey={(invoice) => invoice.id}
            ariaLabel="Tagihan pelanggan"
            emptyMessage="Belum ada tagihan."
          />
        </CardContent>
      </Card>
    </div>
  );
}
