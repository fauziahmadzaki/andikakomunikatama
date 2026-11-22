"use client";

import { ArrowLeftIcon, Building2Icon, EyeIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { SelectField } from "@/components/shared/SelectField";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { BillingRunPeriodMode } from "@/features/billing/data/period";
import { useBulkBillingPage } from "@/features/billing/hooks/useBulkBillingPage";
import { formatRupiah } from "@/lib/format";
import { BranchBillingPreviewDialog } from "./BranchBillingPreviewDialog";

const periodModeOptions: Array<{
  value: BillingRunPeriodMode;
  label: string;
}> = [
  { value: "unbilled", label: "Belum ditagih" },
  { value: "single", label: "Satu periode" },
  { value: "next", label: "N periode ke depan" },
  { value: "6months", label: "6 bulan" },
  { value: "1year", label: "1 tahun" },
];

export function BulkBillingPage() {
  const {
    branches,
    mode,
    setMode,
    startPeriod,
    setStartPeriod,
    count,
    setCount,
    selectedBranchIds,
    toggleBranch,
    selectAllBranches,
    clearBranches,
    branchSummaries,
    dialogSummary,
    openPreview,
    closePreview,
  } = useBulkBillingPage();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="space-y-3">
        <LinkButton
          href="/dashboard/tagihan"
          variant="ghost"
          size="sm"
          className="-ml-2"
        >
          <ArrowLeftIcon />
          Kembali ke tagihan
        </LinkButton>
        <PageHeader
          title="Tagih masal"
          description="Pilih cabang dan pelanggan yang akan ditagih."
        />
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Periode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Cara generate</p>
              <SelectField
                value={mode}
                onValueChange={(value) =>
                  setMode(value as BillingRunPeriodMode)
                }
                ariaLabel="Cara generate periode masal"
                options={periodModeOptions}
              />
            </div>

            {mode !== "unbilled" ? (
              <Field>
                <FieldLabel htmlFor="bulk-start-period">
                  Periode mulai
                </FieldLabel>
                <Input
                  id="bulk-start-period"
                  type="month"
                  value={startPeriod}
                  onChange={(event) => setStartPeriod(event.target.value)}
                />
              </Field>
            ) : (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                Periode dihitung dari awal langganan tiap pelanggan sampai
                periode berjalan.
              </div>
            )}

            {mode === "next" ? (
              <Field>
                <FieldLabel htmlFor="bulk-period-count">
                  Jumlah periode
                </FieldLabel>
                <Input
                  id="bulk-period-count"
                  type="number"
                  min={1}
                  max={24}
                  value={count}
                  onChange={(event) => setCount(event.target.value)}
                />
              </Field>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
          <CardTitle>Cabang</CardTitle>
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="xs" onPress={selectAllBranches}>
              Pilih semua
            </Button>
            <Button type="button" variant="ghost" size="xs" onPress={clearBranches}>
              Kosongkan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {branches.map((branch) => (
              <label
                key={branch.id}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedBranchIds.has(branch.id)}
                  onChange={() => toggleBranch(branch.id)}
                  className="size-4 rounded border-input accent-primary"
                />
                <Building2Icon className="size-4 text-muted-foreground" />
                <span className="font-medium">{branch.name}</span>
              </label>
            ))}
          </div>

          {branchSummaries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Pilih minimal satu cabang untuk mulai menagih.
            </p>
          ) : (
            <div className="space-y-2">
              {branchSummaries.map((summary) => (
                <div
                  key={summary.branch.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{summary.branch.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {summary.billableCount} pelanggan siap ditagih
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold">
                      {formatRupiah(summary.total)}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      isDisabled={summary.billableCount === 0}
                      onPress={() => openPreview(summary.branch.id)}
                    >
                      <EyeIcon />
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {dialogSummary ? (
        <BranchBillingPreviewDialog
          key={`${dialogSummary.branch.id}-${mode}-${startPeriod}-${count}`}
          open
          branchName={dialogSummary.branch.name}
          rows={dialogSummary.rows}
          mode={mode}
          startPeriod={startPeriod}
          count={Number(count) || 1}
          onClose={closePreview}
        />
      ) : null}
    </div>
  );
}
