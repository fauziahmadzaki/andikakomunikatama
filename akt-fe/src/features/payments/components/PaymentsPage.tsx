"use client";

import {
  CheckIcon,
  EyeIcon,
  RotateCcwIcon,
  XIcon,
} from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { SelectField } from "@/components/shared/SelectField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  paymentMethodLabel,
  paymentStatusLabel,
  paymentStatusTone,
} from "@/features/payments/data/status";
import type { Payment, PaymentStatus } from "@/features/payments/data/types";
import { usePaymentsPage } from "@/features/payments/hooks/usePayments";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { PaymentDetailDialog } from "./PaymentDetailDialog";

export function PaymentsPage() {
  const {
    payments,
    branches,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    branchFilter,
    setBranchFilter,
    methodFilter,
    setMethodFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    resetFilters,
    stats,
    detail,
    setDetail,
    confirm,
    setConfirm,
    confirmAction,
  } = usePaymentsPage();

  const columns: DataTableColumn<Payment>[] = [
    {
      key: "number",
      header: "Kode pembayaran / invoice",
      cell: (payment) => (
        <div>
          <p className="font-mono text-xs font-medium">{payment.number}</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {payment.invoiceNumber ?? "-"}
          </p>
        </div>
      ),
    },
    {
      key: "customerName",
      header: "Nama pelanggan",
      cell: (payment) => (
        <span className="font-medium">{payment.customerName}</span>
      ),
    },
    {
      key: "serviceName",
      header: "Layanan",
      cell: (payment) => (
        <span className="text-muted-foreground">{payment.serviceName}</span>
      ),
    },
    {
      key: "method",
      header: "Metode",
      cell: (payment) => paymentMethodLabel[payment.method],
    },
    {
      key: "proof",
      header: "Bukti pembayaran",
      cell: (payment) => (
        <span className="text-xs text-muted-foreground">
          {payment.proofFileName ?? "-"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Nominal pembayaran",
      align: "right",
      cell: (payment) => formatRupiah(payment.amount),
    },
    {
      key: "paidAmount",
      header: "Nominal terbayarkan",
      align: "right",
      cell: (payment) => (
        <span className="font-medium">{formatRupiah(payment.paidAmount)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (payment) => (
        <StatusBadge tone={paymentStatusTone[payment.status]}>
          {paymentStatusLabel[payment.status]}
        </StatusBadge>
      ),
    },
    {
      key: "paidAt",
      header: "Waktu",
      cell: (payment) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(payment.paidAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (payment) => (
        <div className="flex justify-end gap-1">
          <ActionIconButton
            icon={EyeIcon}
            label="Lihat detail pembayaran"
            onPress={() => setDetail(payment)}
          />
          {payment.status === "pending" ? (
            <>
              <ActionIconButton
                icon={CheckIcon}
                label="Verifikasi pembayaran"
                onPress={() => setConfirm({ payment, action: "verify" })}
              />
              <ActionIconButton
                icon={XIcon}
                label="Tolak pembayaran"
                tone="destructive"
                onPress={() => setConfirm({ payment, action: "reject" })}
              />
            </>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Pembayaran layanan"
        description="Pantau pembayaran layanan pelanggan dan status pelunasannya."
      >
        <LinkButton href="/dashboard/keuangan" variant="outline">
          Keuangan
        </LinkButton>
        <LinkButton href="/dashboard/pembayaran/rekonsiliasi" variant="outline">
          Rekonsiliasi
        </LinkButton>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total pembayaran", value: stats.total },
          { label: "Lunas", value: stats.paid },
          { label: "Pending", value: stats.pending },
          { label: "Belum lunas", value: stats.partial },
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
              placeholder="Cari kode, invoice, pelanggan, layanan, atau referensi…"
              className="lg:max-w-sm"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="w-full lg:w-40">
              <SelectField
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as "all" | PaymentStatus)
                }
                ariaLabel="Filter status pembayaran"
                options={[
                  { value: "all", label: "Semua status" },
                  { value: "paid", label: "Lunas" },
                  { value: "pending", label: "Pending" },
                  { value: "partial", label: "Belum lunas" },
                  { value: "rejected", label: "Ditolak" },
                  { value: "void", label: "Dibatalkan" },
                ]}
              />
            </div>
            <div className="w-full lg:w-44">
              <SelectField
                value={branchFilter}
                onValueChange={setBranchFilter}
                ariaLabel="Filter cabang pembayaran"
                options={[
                  { value: "all", label: "Semua cabang" },
                  ...branches.map((branch) => ({
                    value: branch.id,
                    label: branch.name,
                  })),
                ]}
              />
            </div>
            <div className="w-full lg:w-32">
              <SelectField
                value={methodFilter}
                onValueChange={(value) =>
                  setMethodFilter(value as typeof methodFilter)
                }
                ariaLabel="Filter metode pembayaran"
                options={[
                  { value: "all", label: "Semua metode" },
                  { value: "qris", label: "QRIS" },
                  { value: "cash", label: "Cash" },
                  { value: "transfer", label: "TF" },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="w-full sm:max-w-44">
              <p className="mb-1 text-xs text-muted-foreground">Dari tanggal</p>
              <Input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
            </div>
            <div className="w-full sm:max-w-44">
              <p className="mb-1 text-xs text-muted-foreground">Sampai tanggal</p>
              <Input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </div>
            <Button type="button" variant="ghost" onPress={resetFilters}>
              <RotateCcwIcon />
              Reset filter
            </Button>
          </div>

          <DataTable
            data={payments}
            columns={columns}
            getRowKey={(payment) => payment.id}
            ariaLabel="Daftar pembayaran layanan"
            emptyMessage="Tidak ada pembayaran."
          />
        </CardContent>
      </Card>

      <PaymentDetailDialog payment={detail} onClose={() => setDetail(null)} />

      <ConfirmationDialog
        open={Boolean(confirm)}
        title={
          confirm?.action === "verify"
            ? "Verifikasi pembayaran?"
            : "Tolak pembayaran?"
        }
        description={
          confirm?.payment
            ? `${confirm.payment.number} · ${formatRupiah(confirm.payment.amount)}`
            : ""
        }
        confirmLabel={confirm?.action === "verify" ? "Verifikasi" : "Tolak"}
        destructive={confirm?.action === "reject"}
        onConfirm={confirmAction}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
