"use client";

import {
  BanIcon,
  EyeIcon,
  PlusIcon,
  RotateCcwIcon,
  Trash2Icon,
} from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { SelectField } from "@/components/shared/SelectField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  journalSourceLabel,
  journalStatusLabel,
  journalStatusTone,
} from "@/features/finance/data/status";
import type {
  JournalEntry,
  JournalLine,
} from "@/features/finance/data/types";
import { useJournalPage } from "@/features/finance/hooks/useFinance";
import { formatDate, formatRupiah } from "@/lib/format";

function journalTotals(journal: JournalEntry) {
  return journal.lines.reduce(
    (totals, line) => ({
      debit: totals.debit + line.debit,
      credit: totals.credit + line.credit,
    }),
    { debit: 0, credit: 0 }
  );
}

export function JournalPage() {
  const {
    journals,
    activeAccounts,
    open,
    setOpen,
    form,
    setField,
    setLine,
    addLine,
    removeLine,
    save,
    detail,
    setDetail,
    confirmVoid,
    setConfirmVoid,
    confirmVoidJournal,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    accountFilter,
    setAccountFilter,
    sourceFilter,
    setSourceFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    resetFilters,
    stats,
  } = useJournalPage();

  const columns: DataTableColumn<JournalEntry>[] = [
    {
      key: "number",
      header: "Jurnal",
      cell: (journal) => {
        const totals = journalTotals(journal);
        return (
          <div>
            <p className="font-mono text-xs font-medium">{journal.number}</p>
            <p className="text-xs text-muted-foreground">
              {journal.description}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {journal.sourceType
                ? journalSourceLabel[journal.sourceType]
                : "Manual"}
              {journal.reference ? ` · ${journal.reference}` : ""}
            </p>
            <p className="text-[11px] text-muted-foreground">
              D {formatRupiah(totals.debit)} · K{" "}
              {formatRupiah(totals.credit)}
            </p>
          </div>
        );
      },
    },
    {
      key: "date",
      header: "Tanggal",
      cell: (journal) => formatDate(journal.date),
    },
    {
      key: "lines",
      header: "Akun",
      cell: (journal) => (
        <div className="space-y-1 text-xs">
          {journal.lines.slice(0, 3).map((line) => (
            <div key={line.id} className="flex gap-2">
              <span className="font-mono text-muted-foreground">
                {line.accountCode}
              </span>
              <span>{line.accountName}</span>
            </div>
          ))}
          {journal.lines.length > 3 ? (
            <p className="text-muted-foreground">
              +{journal.lines.length - 3} baris lain
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (journal) => (
        <StatusBadge tone={journalStatusTone[journal.status]}>
          {journalStatusLabel[journal.status]}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (journal) => (
        <div className="flex justify-end gap-1">
          <ActionIconButton
            icon={EyeIcon}
            label="Lihat detail jurnal"
            onPress={() => setDetail(journal)}
          />
          {journal.status === "posted" ? (
            <ActionIconButton
              icon={BanIcon}
              label="Batalkan jurnal"
              tone="destructive"
              onPress={() => setConfirmVoid(journal)}
            />
          ) : null}
        </div>
      ),
    },
  ];

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

  const formTotals = form.lines.reduce(
    (totals, line) => ({
      debit: totals.debit + (Number(line.debit) || 0),
      credit: totals.credit + (Number(line.credit) || 0),
    }),
    { debit: 0, credit: 0 }
  );
  const balanced =
    formTotals.debit > 0 && formTotals.debit === formTotals.credit;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Jurnal umum"
        description="Semua transaksi keuangan tercatat sebagai jurnal double-entry."
      >
        <Button onPress={() => setOpen(true)}>
          <PlusIcon />
          Buat jurnal
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total debit", value: formatRupiah(stats.totalDebit) },
          { label: "Total kredit", value: formatRupiah(stats.totalCredit) },
          { label: "Jurnal posted", value: stats.posted },
          { label: "Jurnal dibatalkan", value: stats.voided },
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
              placeholder="Cari nomor, deskripsi, atau referensi…"
              className="lg:max-w-sm"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="w-full lg:w-40">
              <SelectField
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as typeof statusFilter)
                }
                ariaLabel="Filter status jurnal"
                options={[
                  { value: "all", label: "Semua status" },
                  { value: "posted", label: "Diposting" },
                  { value: "draft", label: "Draft" },
                  { value: "void", label: "Dibatalkan" },
                ]}
              />
            </div>
            <div className="w-full lg:w-56">
              <SelectField
                value={accountFilter}
                onValueChange={setAccountFilter}
                ariaLabel="Filter akun jurnal"
                options={[
                  { value: "all", label: "Semua akun" },
                  ...activeAccounts.map((account) => ({
                    value: account.id,
                    label: `${account.code} — ${account.name}`,
                  })),
                ]}
              />
            </div>
            <div className="w-full lg:w-44">
              <SelectField
                value={sourceFilter}
                onValueChange={(value) =>
                  setSourceFilter(value as typeof sourceFilter)
                }
                ariaLabel="Filter sumber jurnal"
                options={[
                  { value: "all", label: "Semua sumber" },
                  { value: "manual", label: "Manual" },
                  { value: "invoice", label: "Invoice" },
                  { value: "payment", label: "Pembayaran" },
                  { value: "deposit", label: "Deposit" },
                  { value: "withdraw", label: "Withdraw" },
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
            data={journals}
            columns={columns}
            getRowKey={(journal) => journal.id}
            ariaLabel="Daftar jurnal"
            emptyMessage="Belum ada jurnal."
          />
        </CardContent>
      </Card>

      <Dialog
        isOpen={open}
        onOpenChange={(isOpen) => !isOpen && setOpen(false)}
        className="sm:max-w-3xl"
      >
        <DialogHeader>
          <DialogTitle>Buat jurnal manual</DialogTitle>
          <DialogDescription>
            Total debit dan kredit harus sama sebelum jurnal diposting.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="journal-date">Tanggal</FieldLabel>
              <Input
                id="journal-date"
                type="date"
                value={form.date}
                onChange={(event) => setField("date", event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="journal-reference">Referensi</FieldLabel>
              <Input
                id="journal-reference"
                value={form.reference}
                onChange={(event) => setField("reference", event.target.value)}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="journal-description">Deskripsi</FieldLabel>
            <Input
              id="journal-description"
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
            />
          </Field>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Baris jurnal</p>
              <Button type="button" variant="outline" size="sm" onPress={addLine}>
                <PlusIcon />
                Tambah baris
              </Button>
            </div>

            <div className="hidden gap-2 px-3 text-xs text-muted-foreground sm:grid sm:grid-cols-[minmax(0,1fr)_7rem_7rem_2.5rem]">
              <span>Akun</span>
              <span>Debit</span>
              <span>Kredit</span>
              <span />
            </div>

            {form.lines.map((line, index) => (
              <div
                key={index}
                className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_7rem_7rem_2.5rem] sm:items-center"
              >
                <div className="min-w-0">
                  <SelectField
                    value={line.accountId}
                    onValueChange={(value) => setLine(index, "accountId", value)}
                    ariaLabel={`Akun baris ${index + 1}`}
                    options={activeAccounts.map((account) => ({
                      value: account.id,
                      label: `${account.code} — ${account.name}`,
                    }))}
                  />
                </div>
                <Input
                  aria-label={`Debit baris ${index + 1}`}
                  type="number"
                  min={0}
                  placeholder="Debit"
                  value={line.debit}
                  onChange={(event) =>
                    setLine(index, "debit", event.target.value)
                  }
                />
                <Input
                  aria-label={`Kredit baris ${index + 1}`}
                  type="number"
                  min={0}
                  placeholder="Kredit"
                  value={line.credit}
                  onChange={(event) =>
                    setLine(index, "credit", event.target.value)
                  }
                />
                <div className="flex justify-end sm:justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Hapus baris"
                    isDisabled={form.lines.length <= 2}
                    onPress={() => removeLine(index)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3 text-sm">
            <span className="text-muted-foreground">
              Debit {formatRupiah(formTotals.debit)} · Kredit{" "}
              {formatRupiah(formTotals.credit)}
            </span>
            <StatusBadge tone={balanced ? "success" : "warning"}>
              {balanced ? "Seimbang" : "Belum seimbang"}
            </StatusBadge>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onPress={() => setOpen(false)}>
            Batal
          </Button>
          <Button type="button" onPress={save}>
            Posting jurnal
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog
        isOpen={Boolean(detail)}
        onOpenChange={(isOpen) => !isOpen && setDetail(null)}
        className="sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>{detail?.number ?? "Detail jurnal"}</DialogTitle>
          <DialogDescription>
            {detail
              ? `${formatDate(detail.date)} · ${
                  detail.sourceType
                    ? journalSourceLabel[detail.sourceType]
                    : "Manual"
                }${detail.reference ? ` · ${detail.reference}` : ""}`
              : ""}
          </DialogDescription>
        </DialogHeader>

        {detail ? (
          <div className="space-y-4">
            <p className="text-sm font-medium">{detail.description}</p>
            <DataTable
              data={detail.lines}
              columns={lineColumns}
              getRowKey={(line) => line.id}
              ariaLabel="Baris jurnal"
              emptyMessage="Tidak ada baris."
            />
            <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3 text-sm">
              <span>
                Debit {formatRupiah(journalTotals(detail).debit)} · Kredit{" "}
                {formatRupiah(journalTotals(detail).credit)}
              </span>
              <StatusBadge tone={journalStatusTone[detail.status]}>
                {journalStatusLabel[detail.status]}
              </StatusBadge>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onPress={() => setDetail(null)}>
            Tutup
          </Button>
        </DialogFooter>
      </Dialog>

      <ConfirmationDialog
        open={Boolean(confirmVoid)}
        title="Batalkan jurnal?"
        description={
          confirmVoid
            ? `${confirmVoid.number} akan ditandai dibatalkan dan dibuat jurnal balik.`
            : ""
        }
        confirmLabel="Batalkan"
        destructive
        onConfirm={confirmVoidJournal}
        onCancel={() => setConfirmVoid(null)}
      />
    </div>
  );
}
