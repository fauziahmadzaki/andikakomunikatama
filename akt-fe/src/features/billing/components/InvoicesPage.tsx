"use client";

import { BanIcon, Building2Icon, EyeIcon, ReceiptIcon } from "lucide-react";

import { useRouter } from "next/navigation";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { SelectField } from "@/components/shared/SelectField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  invoiceStatusLabel,
  invoiceStatusTone,
} from "@/features/billing/data/status";
import type { Invoice } from "@/features/billing/data/types";
import { useInvoicesPage } from "@/features/billing/hooks/useBilling";
import { formatDate, formatRupiah } from "@/lib/format";

export function InvoicesPage() {
  const router = useRouter();
  const {
    invoices,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    periodFilter,
    setPeriodFilter,
    customPeriodStart,
    setCustomPeriodStart,
    customPeriodEnd,
    setCustomPeriodEnd,
    stats,
    confirmInvoiceId,
    setConfirmInvoiceId,
    confirmVoid,
  } = useInvoicesPage();

  const columns: DataTableColumn<Invoice>[] = [
    {
      key: "number",
      header: "Invoice",
      cell: (invoice) => (
        <div>
          <p className="font-mono text-xs font-medium">{invoice.number}</p>
          <p className="text-xs text-muted-foreground">
            {invoice.customerName}
          </p>
        </div>
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
      cell: (invoice) => formatDate(invoice.dueDate),
    },
    {
      key: "total",
      header: "Total",
      cell: (invoice) => formatRupiah(invoice.total),
    },
    {
      key: "paidAmount",
      header: "Terbayar",
      cell: (invoice) => formatRupiah(invoice.paidAmount),
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
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (invoice) => (
        <div className="flex justify-end gap-1">
          <ActionIconButton
            icon={EyeIcon}
            label="Lihat detail invoice"
            onPress={() => {
              router.push(`/dashboard/tagihan/${invoice.id}`);
            }}
          />
          {invoice.status !== "paid" && invoice.status !== "void" ? (
            <ActionIconButton
              icon={BanIcon}
              label="Batalkan invoice"
              tone="destructive"
              onPress={() => setConfirmInvoiceId(invoice.id)}
            />
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Tagihan"
        description="Kelola invoice bulanan, manual, dan status pembayaran."
      >
        <LinkButton href="/dashboard/tagihan/manual" variant="outline">
          <ReceiptIcon />
          Tagih manual
        </LinkButton>
        <LinkButton href="/dashboard/tagihan/masal">
          <Building2Icon />
          Tagih masal
        </LinkButton>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total invoice", value: stats.total },
          { label: "Diterbitkan", value: stats.issued },
          { label: "Terlambat", value: stats.overdue },
          { label: "Outstanding", value: formatRupiah(stats.outstanding) },
        ].map((item) => (
          <Card key={item.label} className="gap-0 py-0">
            <CardContent className="space-y-1 p-5">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-bold tracking-tight">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="gap-0 py-0">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-2 lg:flex-row">
            <Input
              placeholder="Cari nomor invoice atau pelanggan…"
              className="lg:max-w-sm"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="w-full lg:w-44">
              <SelectField
                value={statusFilter}
                onValueChange={setStatusFilter}
                ariaLabel="Filter status invoice"
                options={[
                  { value: "all", label: "Semua status" },
                  { value: "issued", label: "Diterbitkan" },
                  { value: "partial", label: "Dibayar sebagian" },
                  { value: "paid", label: "Lunas" },
                  { value: "overdue", label: "Terlambat" },
                  { value: "void", label: "Dibatalkan" },
                ]}
              />
            </div>
            <div className="w-full lg:w-44">
              <SelectField
                value={periodFilter}
                onValueChange={setPeriodFilter}
                ariaLabel="Filter periode tagihan"
                options={[
                  { value: "current", label: "Periode ini" },
                  { value: "last3", label: "3 periode lalu" },
                  { value: "all", label: "Semua periode" },
                  { value: "custom", label: "Custom periode" },
                ]}
              />
            </div>
          </div>

          {periodFilter === "custom" ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:max-w-md">
              <Field>
                <FieldLabel htmlFor="invoice-period-start">
                  Dari periode
                </FieldLabel>
                <Input
                  id="invoice-period-start"
                  type="month"
                  value={customPeriodStart}
                  onChange={(event) =>
                    setCustomPeriodStart(event.target.value)
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="invoice-period-end">
                  Sampai periode
                </FieldLabel>
                <Input
                  id="invoice-period-end"
                  type="month"
                  value={customPeriodEnd}
                  onChange={(event) =>
                    setCustomPeriodEnd(event.target.value)
                  }
                />
              </Field>
            </div>
          ) : null}

          <DataTable
            data={invoices}
            columns={columns}
            getRowKey={(invoice) => invoice.id}
            ariaLabel="Daftar invoice"
            emptyMessage="Tidak ada invoice."
          />
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={Boolean(confirmInvoiceId)}
        title="Batalkan invoice?"
        description="Invoice yang sudah dibayar tidak boleh dibatalkan tanpa refund."
        confirmLabel="Batalkan"
        destructive
        onConfirm={confirmVoid}
        onCancel={() => setConfirmInvoiceId(null)}
      />
    </div>
  );
}
