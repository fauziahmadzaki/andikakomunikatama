"use client";

import {
  BookOpenIcon,
  MinusIcon,
  PlusIcon,
  ReceiptIcon,
  RotateCcwIcon,
} from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { SelectField } from "@/components/shared/SelectField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  financeCategoryLabel,
  financeKindLabel,
  financeMethodLabel,
} from "@/features/finance/data/labels";
import type { FinanceTransaction } from "@/features/finance/data/types";
import { useFinanceOverview } from "@/features/finance/hooks/useFinance";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { DepositDialog } from "./DepositDialog";
import { WithdrawDialog } from "./WithdrawDialog";

export function FinanceOverviewPage() {
  const {
    transactions,
    branches,
    query,
    setQuery,
    kindFilter,
    setKindFilter,
    categoryFilter,
    setCategoryFilter,
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
  } = useFinanceOverview();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const columns: DataTableColumn<FinanceTransaction>[] = [
    {
      key: "paidAt",
      header: "Waktu",
      cell: (transaction) => formatDateTime(transaction.paidAt),
    },
    {
      key: "kind",
      header: "Tipe",
      cell: (transaction) => (
        <StatusBadge
          tone={transaction.kind === "deposit" ? "success" : "warning"}
        >
          {financeKindLabel[transaction.kind]}
        </StatusBadge>
      ),
    },
    {
      key: "category",
      header: "Kategori",
      cell: (transaction) => financeCategoryLabel[transaction.category],
    },
    {
      key: "description",
      header: "Keterangan",
      cell: (transaction) => (
        <div>
          <p className="font-medium">{transaction.description}</p>
          <p className="text-xs text-muted-foreground">
            {transaction.customerName ?? transaction.payerName ?? "-"}
            {transaction.invoiceNumber
              ? ` · ${transaction.invoiceNumber}`
              : ""}
          </p>
        </div>
      ),
    },
    {
      key: "branchName",
      header: "Cabang",
      cell: (transaction) => (
        <span className="text-muted-foreground">
          {transaction.branchName ?? "-"}
        </span>
      ),
    },
    {
      key: "method",
      header: "Metode",
      cell: (transaction) => financeMethodLabel[transaction.method],
    },
    {
      key: "amount",
      header: "Nominal",
      align: "right",
      cell: (transaction) => (
        <span
          className={
            transaction.direction === "income"
              ? "font-medium text-emerald-600"
              : "font-medium text-destructive"
          }
        >
          {transaction.direction === "income" ? "+" : "-"}
          {formatRupiah(transaction.amount)}
        </span>
      ),
    },
    {
      key: "proof",
      header: "Bukti",
      cell: (transaction) => (
        <span className="text-xs text-muted-foreground">
          {transaction.proofFileName ?? "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Keuangan"
        description="Ringkasan pemasukan, pengeluaran, deposit, dan withdraw."
      >
        <LinkButton href="/dashboard/keuangan/jurnal" variant="outline">
          <BookOpenIcon />
          Jurnal
        </LinkButton>
        <LinkButton href="/dashboard/keuangan/kas" variant="outline">
          <ReceiptIcon />
          Kas
        </LinkButton>
        <Button variant="outline" onPress={() => setWithdrawOpen(true)}>
          <MinusIcon />
          Withdraw
        </Button>
        <Button onPress={() => setDepositOpen(true)}>
          <PlusIcon />
          Deposit
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Pemasukan", value: formatRupiah(stats.revenue) },
          { label: "Pengeluaran", value: formatRupiah(stats.expense) },
          { label: "Net", value: formatRupiah(stats.profit) },
          { label: "Transaksi", value: stats.count },
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
              placeholder="Cari keterangan, pelanggan, penyetor, atau referensi…"
              className="lg:max-w-sm"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="w-full lg:w-36">
              <SelectField
                value={kindFilter}
                onValueChange={(value) =>
                  setKindFilter(value as typeof kindFilter)
                }
                ariaLabel="Filter tipe transaksi"
                options={[
                  { value: "all", label: "Semua tipe" },
                  { value: "deposit", label: "Deposit" },
                  { value: "withdraw", label: "Withdraw" },
                ]}
              />
            </div>
            <div className="w-full lg:w-52">
              <SelectField
                value={categoryFilter}
                onValueChange={(value) =>
                  setCategoryFilter(value as typeof categoryFilter)
                }
                ariaLabel="Filter kategori transaksi"
                options={[
                  { value: "all", label: "Semua kategori" },
                  { value: "service_payment", label: "Pembayaran layanan" },
                  { value: "general_income", label: "Pemasukan lainnya" },
                  { value: "salary", label: "Gaji" },
                  { value: "equipment", label: "Pembelian alat" },
                  { value: "other_expense", label: "Pengeluaran lainnya" },
                ]}
              />
            </div>
            <div className="w-full lg:w-44">
              <SelectField
                value={branchFilter}
                onValueChange={setBranchFilter}
                ariaLabel="Filter cabang transaksi"
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
                ariaLabel="Filter metode transaksi"
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
            data={transactions}
            columns={columns}
            getRowKey={(transaction) => transaction.id}
            ariaLabel="Riwayat transaksi keuangan"
            emptyMessage="Belum ada transaksi."
          />
        </CardContent>
      </Card>

      {depositOpen ? (
        <DepositDialog open onClose={() => setDepositOpen(false)} />
      ) : null}
      {withdrawOpen ? (
        <WithdrawDialog open onClose={() => setWithdrawOpen(false)} />
      ) : null}
    </div>
  );
}
