"use client";

import { EyeIcon, RotateCcwIcon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { SelectField } from "@/components/shared/SelectField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, LinkButton } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  journalStatusLabel,
  journalStatusTone,
} from "@/features/finance/data/status";
import type { JournalLine } from "@/features/finance/data/types";
import {
  useCashLedger,
  type CashMovement,
} from "@/features/finance/hooks/useFinance";
import { formatDate, formatRupiah } from "@/lib/format";

export function CashPage() {
  const {
    movements,
    journals,
    cashAccounts,
    accountBalances,
    query,
    setQuery,
    accountFilter,
    setAccountFilter,
    directionFilter,
    setDirectionFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    resetFilters,
    detail,
    setDetail,
    stats,
  } = useCashLedger();

  const columns: DataTableColumn<CashMovement>[] = [
    {
      key: "date",
      header: "Tanggal",
      cell: (movement) => formatDate(movement.date),
    },
    {
      key: "journal",
      header: "Jurnal",
      cell: (movement) => (
        <div>
          <p className="font-mono text-xs">{movement.journalNumber}</p>
          <p className="text-xs text-muted-foreground">
            {movement.reference ?? "-"}
          </p>
        </div>
      ),
    },
    {
      key: "description",
      header: "Keterangan",
      cell: (movement) => (
        <span className="font-medium">{movement.description}</span>
      ),
    },
    {
      key: "account",
      header: "Akun",
      cell: (movement) => (
        <div>
          <p>{movement.accountName}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {movement.accountCode}
          </p>
        </div>
      ),
    },
    {
      key: "in",
      header: "Masuk",
      align: "right",
      cell: (movement) =>
        movement.direction === "in" ? (
          <span className="font-medium text-emerald-600">
            {formatRupiah(movement.amount)}
          </span>
        ) : (
          "-"
        ),
    },
    {
      key: "out",
      header: "Keluar",
      align: "right",
      cell: (movement) =>
        movement.direction === "out" ? (
          <span className="font-medium text-destructive">
            {formatRupiah(movement.amount)}
          </span>
        ) : (
          "-"
        ),
    },
    {
      key: "balance",
      header: "Saldo",
      align: "right",
      cell: (movement) => (
        <span className="font-semibold">{formatRupiah(movement.balance)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (movement) => (
        <ActionIconButton
          icon={EyeIcon}
          label="Lihat detail mutasi kas"
          onPress={() => setDetail(movement)}
        />
      ),
    },
  ];

  const detailJournal = detail
    ? journals.find((journal) => journal.id === detail.journalId)
    : undefined;

  const lineColumns: DataTableColumn<JournalLine>[] = [
    {
      key: "account",
      header: "Akun",
      cell: (line) => (
        <div>
          <p className="font-medium">{line.accountName}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {line.accountCode}
          </p>
        </div>
      ),
    },
    {
      key: "debit",
      header: "Debit",
      align: "right",
      cell: (line) => formatRupiah(line.debit),
    },
    {
      key: "credit",
      header: "Kredit",
      align: "right",
      cell: (line) => formatRupiah(line.credit),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Kas & bank"
        description="Mutasi kas dan bank berasal dari jurnal yang sudah diposting."
      >
        <LinkButton href="/dashboard/keuangan/jurnal" variant="outline">
          Buat jurnal
        </LinkButton>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {accountBalances.map((item) => (
          <Card key={item.account.id} className="gap-0 py-0">
            <CardContent className="space-y-1 p-5">
              <p className="text-sm text-muted-foreground">
                {item.account.name}
              </p>
              <p className="text-xl font-bold tracking-tight">
                {formatRupiah(item.balance)}
              </p>
            </CardContent>
          </Card>
        ))}
        <Card className="gap-0 py-0">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Masuk / keluar</p>
            <p className="text-sm font-semibold text-emerald-600">
              +{formatRupiah(stats.totalIn)}
            </p>
            <p className="text-sm font-semibold text-destructive">
              -{formatRupiah(stats.totalOut)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 py-0">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-2 lg:flex-row">
            <Input
              placeholder="Cari nomor jurnal, referensi, atau keterangan…"
              className="lg:max-w-sm"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="w-full lg:w-56">
              <SelectField
                value={accountFilter}
                onValueChange={setAccountFilter}
                ariaLabel="Filter akun kas"
                options={[
                  { value: "all", label: "Semua akun" },
                  ...cashAccounts.map((account) => ({
                    value: account.id,
                    label: `${account.code} — ${account.name}`,
                  })),
                ]}
              />
            </div>
            <div className="w-full lg:w-40">
              <SelectField
                value={directionFilter}
                onValueChange={(value) =>
                  setDirectionFilter(value as typeof directionFilter)
                }
                ariaLabel="Filter arah mutasi"
                options={[
                  { value: "all", label: "Semua arah" },
                  { value: "in", label: "Masuk" },
                  { value: "out", label: "Keluar" },
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
            data={movements}
            columns={columns}
            getRowKey={(movement) => movement.id}
            ariaLabel="Mutasi kas dan bank"
            emptyMessage="Belum ada mutasi kas."
          />
        </CardContent>
      </Card>

      <Dialog
        isOpen={Boolean(detail)}
        onOpenChange={(isOpen) => !isOpen && setDetail(null)}
        className="sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>
            {detail ? detail.journalNumber : "Detail mutasi kas"}
          </DialogTitle>
          <DialogDescription>
            {detail
              ? `${formatDate(detail.date)} · ${detail.accountName}`
              : ""}
          </DialogDescription>
        </DialogHeader>

        {detail ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                tone={detail.direction === "in" ? "success" : "warning"}
              >
                {detail.direction === "in" ? "Masuk" : "Keluar"}
              </StatusBadge>
              <span className="text-sm font-medium">
                {formatRupiah(detail.amount)}
              </span>
              <span className="text-sm text-muted-foreground">
                Saldo setelah transaksi {formatRupiah(detail.balance)}
              </span>
            </div>
            <p className="text-sm font-medium">{detail.description}</p>
            {detailJournal ? (
              <>
                <DataTable
                  data={detailJournal.lines}
                  columns={lineColumns}
                  getRowKey={(line) => line.id}
                  ariaLabel="Baris jurnal mutasi kas"
                  emptyMessage="Tidak ada baris."
                />
                <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3 text-sm">
                  <span>
                    Debit{" "}
                    {formatRupiah(
                      detailJournal.lines.reduce(
                        (total, line) => total + line.debit,
                        0
                      )
                    )}{" "}
                    · Kredit{" "}
                    {formatRupiah(
                      detailJournal.lines.reduce(
                        (total, line) => total + line.credit,
                        0
                      )
                    )}
                  </span>
                  <StatusBadge
                    tone={journalStatusTone[detailJournal.status]}
                  >
                    {journalStatusLabel[detailJournal.status]}
                  </StatusBadge>
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onPress={() => setDetail(null)}>
            Tutup
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
