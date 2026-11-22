"use client";

import { ArrowLeftIcon, ReceiptIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { SelectField } from "@/components/shared/SelectField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  useBillingRun,
} from "@/features/billing/hooks/useBilling";
import type { BillingRunPeriodMode } from "@/features/billing/data/period";
import {
  serviceStatusLabel,
  serviceStatusTone,
  subscriptionStatusLabel,
  subscriptionTone,
} from "@/features/subscriptions/data/status";
import { formatRupiah } from "@/lib/format";

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

export function BillingRunPage() {
  const {
    customers,
    customerId,
    selectCustomer,
    customerSubscriptions,
    subscription,
    plan,
    branchName,
    subscriptionServices,
    mode,
    setMode,
    startPeriod,
    setStartPeriod,
    count,
    setCount,
    periodsToCreate,
    skippedPeriods,
    estimatedTotal,
    result,
    commit,
  } = useBillingRun();

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
          title="Generate invoice"
          description="Buat invoice berdasarkan pelanggan, layanan, dan periode."
        />
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Pelanggan & layanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Pelanggan</p>
            <SelectField
              value={customerId}
              onValueChange={selectCustomer}
              ariaLabel="Pilih pelanggan"
              options={customers.map((item) => ({
                value: item.id,
                label: `${item.fullName} — ${item.customerNumber}`,
              }))}
            />
          </div>

          {customerSubscriptions.length === 0 ? (
            <p
              role="alert"
              className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-400"
            >
              Pelanggan ini belum memiliki layanan/langganan aktif.
            </p>
          ) : null}

          {subscription ? (
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Paket</p>
                  <p className="font-medium">{plan?.name ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Biaya bulanan</p>
                  <p className="font-medium">
                    {formatRupiah(subscription.priceSnapshot)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Jatuh tempo</p>
                  <p className="font-medium">
                    Tanggal {subscription.dueDay}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusBadge
                    tone={subscriptionTone[subscription.status]}
                  >
                    {subscriptionStatusLabel[subscription.status]}
                  </StatusBadge>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs text-muted-foreground">Cabang</p>
                <p className="text-sm font-medium">{branchName}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Service terpasang</p>
                {subscriptionServices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Belum ada service terdaftar.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {subscriptionServices.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-medium uppercase">
                            {service.serviceType}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {service.username}
                          </p>
                        </div>
                        <StatusBadge tone={serviceStatusTone[service.status]}>
                          {serviceStatusLabel[service.status]}
                        </StatusBadge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

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
                ariaLabel="Cara generate periode"
                options={periodModeOptions}
              />
            </div>

            {mode !== "unbilled" ? (
              <Field>
                <FieldLabel htmlFor="billing-start-period">
                  Periode mulai
                </FieldLabel>
                <Input
                  id="billing-start-period"
                  type="month"
                  value={startPeriod}
                  onChange={(event) => setStartPeriod(event.target.value)}
                />
              </Field>
            ) : (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                Periode dihitung dari awal langganan sampai periode berjalan.
              </div>
            )}

            {mode === "next" ? (
              <Field>
                <FieldLabel htmlFor="billing-period-count">
                  Jumlah periode
                </FieldLabel>
                <Input
                  id="billing-period-count"
                  type="number"
                  min={1}
                  max={24}
                  value={count}
                  onChange={(event) => setCount(event.target.value)}
                />
              </Field>
            ) : null}
          </div>

          <div className="space-y-3 rounded-lg bg-muted/50 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Invoice akan dibuat</span>
              <span className="font-semibold">
                {periodsToCreate.length > 0 ? 1 : 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Jumlah periode</span>
              <span className="font-semibold">{periodsToCreate.length}</span>
            </div>
            {periodsToCreate.length > 0 ? (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rentang periode</span>
                <span className="font-mono text-xs">
                  {periodsToCreate[0]} –{" "}
                  {periodsToCreate[periodsToCreate.length - 1]}
                </span>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Periode dilewati (sudah ada)
              </span>
              <span className="font-semibold">{skippedPeriods.length}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-muted-foreground">Estimasi total</span>
              <span className="font-semibold">{formatRupiah(estimatedTotal)}</span>
            </div>

            {periodsToCreate.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {periodsToCreate.map((period) => (
                  <span
                    key={period}
                    className="rounded-md bg-background px-2 py-0.5 font-mono text-xs ring-1 ring-foreground/15"
                  >
                    {period}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Tidak ada periode baru yang perlu dibuat.
              </p>
            )}

            {skippedPeriods.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                Dilewati: {skippedPeriods.join(", ")}
              </p>
            ) : null}
          </div>

          <Button
            className="w-full"
            onPress={commit}
            isDisabled={!subscription || periodsToCreate.length === 0}
          >
            <ReceiptIcon />
            Generate invoice
          </Button>

          {result ? (
            <p
              className={
                result.created > 0
                  ? "rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm"
                  : "rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm"
              }
            >
              {result.created > 0
                ? "Invoice berhasil dibuat."
                : result.conflicts.length > 0
                  ? `Periode sudah ditagih: ${result.conflicts.join(", ")}.`
                  : "Tidak ada invoice yang dibuat."}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
