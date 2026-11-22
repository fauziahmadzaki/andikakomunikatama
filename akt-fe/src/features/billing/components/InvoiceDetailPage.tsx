"use client";

import { ArrowLeftIcon, BanIcon, PrinterIcon } from "lucide-react";

import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  invoiceStatusLabel,
  invoiceStatusTone,
} from "@/features/billing/data/status";
import type { InvoiceItem } from "@/features/billing/data/types";
import { useInvoiceDetail } from "@/features/billing/hooks/useBilling";
import { formatDate, formatRupiah } from "@/lib/format";

export function InvoiceDetailPage({ id }: { id: string }) {
  const { invoice, confirmOpen, setConfirmOpen, confirmVoid } =
    useInvoiceDetail(id);

  if (!invoice) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">Invoice tidak ditemukan</p>
        <LinkButton href="/dashboard/tagihan">Kembali ke tagihan</LinkButton>
      </div>
    );
  }

  const columns: DataTableColumn<InvoiceItem>[] = [
    {
      key: "description",
      header: "Deskripsi",
      cell: (item) => <span className="font-medium">{item.description}</span>,
    },
    { key: "quantity", header: "Qty" },
    {
      key: "unitPrice",
      header: "Harga",
      cell: (item) => formatRupiah(item.unitPrice),
    },
    {
      key: "taxAmount",
      header: "PPN",
      cell: (item) => formatRupiah(item.taxAmount),
    },
    {
      key: "total",
      header: "Total",
      cell: (item) => formatRupiah(item.total),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="space-y-3">
        <LinkButton
          href="/dashboard/tagihan"
          variant="ghost"
          size="sm"
          className="-ml-2 print:hidden"
        >
          <ArrowLeftIcon />
          Kembali ke tagihan
        </LinkButton>
        <PageHeader
          title={invoice.number}
          description={`${invoice.customerName} · ${invoice.branchName}`}
        >
          <StatusBadge tone={invoiceStatusTone[invoice.status]}>
            {invoiceStatusLabel[invoice.status]}
          </StatusBadge>
          {invoice.status !== "paid" && invoice.status !== "void" ? (
            <Button
              variant="destructive"
              className="print:hidden"
              onPress={() => setConfirmOpen(true)}
            >
              <BanIcon />
              Batalkan
            </Button>
          ) : null}
          <Button
            variant="outline"
            className="print:hidden"
            onPress={() => window.print()}
          >
            <PrinterIcon />
            Cetak
          </Button>
        </PageHeader>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Periode", value: `${formatDate(invoice.periodStart)} – ${formatDate(invoice.periodEnd)}` },
          { label: "Jatuh tempo", value: formatDate(invoice.dueDate) },
          { label: "Total", value: formatRupiah(invoice.total) },
          { label: "Terbayar", value: formatRupiah(invoice.paidAmount) },
        ].map((item) => (
          <Card key={item.label} className="gap-0 py-0">
            <CardContent className="space-y-1 p-5">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-lg font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="gap-0 py-0">
        <CardContent className="p-4">
          <DataTable
            data={invoice.items}
            columns={columns}
            getRowKey={(item) => item.id}
            ariaLabel="Item invoice"
            emptyMessage="Tidak ada item."
          />
          <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatRupiah(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Diskon</span>
              <span>-{formatRupiah(invoice.discountTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">PPN</span>
              <span>{formatRupiah(invoice.taxTotal)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span>{formatRupiah(invoice.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={confirmOpen}
        title="Batalkan invoice?"
        description="Invoice yang sudah dibayar tidak boleh dibatalkan tanpa refund."
        confirmLabel="Batalkan"
        destructive
        onConfirm={confirmVoid}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
