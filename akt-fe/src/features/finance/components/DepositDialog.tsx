"use client";

import { CustomerPicker } from "@/components/shared/CustomerPicker";
import { SelectField } from "@/components/shared/SelectField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDepositDialog } from "@/features/finance/hooks/useFinance";
import type { PaymentMethod } from "@/features/payments/data/types";
import { formatDate, formatRupiah } from "@/lib/format";

const methodOptions = [
  { value: "qris", label: "QRIS" },
  { value: "cash", label: "Cash" },
  { value: "transfer", label: "TF" },
];

export function DepositDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    type,
    setType,
    branches,
    branchId,
    setBranchId,
    customers,
    customerId,
    selectCustomer,
    customer,
    subscription,
    plan,
    outstandingInvoices,
    invoice,
    setInvoiceId,
    outstanding,
    mode,
    setMode,
    amount,
    setAmount,
    effectiveAmount,
    method,
    setMethod,
    paidAt,
    setPaidAt,
    proofFileName,
    setProofFileName,
    payerName,
    setPayerName,
    reference,
    setReference,
    notes,
    setNotes,
    markPending,
    setMarkPending,
    save,
  } = useDepositDialog({ onClose });

  return (
    <Dialog
      isOpen={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      className="sm:max-w-2xl"
    >
      <DialogHeader>
        <DialogTitle>Deposit</DialogTitle>
        <DialogDescription>
          Catat uang masuk untuk pembayaran layanan atau pemasukan lainnya.
        </DialogDescription>
      </DialogHeader>

      <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Tipe deposit</p>
          <SelectField
            value={type}
            onValueChange={(value) => setType(value as "service" | "general")}
            ariaLabel="Tipe deposit"
            options={[
              { value: "service", label: "Pembayaran layanan" },
              { value: "general", label: "Lainnya" },
            ]}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Cabang</p>
            <SelectField
              value={branchId}
              onValueChange={(value) => {
                setBranchId(value);
                selectCustomer("");
              }}
              ariaLabel="Filter cabang deposit"
              options={[
                { value: "all", label: "Semua cabang" },
                ...branches.map((branch) => ({
                  value: branch.id,
                  label: branch.name,
                })),
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium">Metode</p>
            <SelectField
              value={method}
              onValueChange={(value) => setMethod(value as PaymentMethod)}
              ariaLabel="Metode deposit"
              options={methodOptions}
            />
          </div>
        </div>

        {type === "service" ? (
          <>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Pelanggan</p>
              <CustomerPicker
                customers={customers}
                value={customerId}
                onValueChange={selectCustomer}
                ariaLabel="Pilih pelanggan deposit"
              />
            </div>

            {customer ? (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="font-medium">{customer.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {customer.customerNumber} ·{" "}
                  {plan?.name ?? "Belum ada layanan aktif"}
                </p>
                {subscription ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Outstanding saat ini: {formatRupiah(outstanding)}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-1.5">
              <p className="text-sm font-medium">Tagihan</p>
              <SelectField
                value={invoice?.id ?? ""}
                onValueChange={setInvoiceId}
                ariaLabel="Pilih tagihan"
                disabled={outstandingInvoices.length === 0}
                placeholder={
                  outstandingInvoices.length === 0
                    ? "Belum ada tagihan belum lunas"
                    : "Pilih tagihan"
                }
                options={outstandingInvoices.map((item) => ({
                  value: item.id,
                  label: `${item.number} · ${formatDate(
                    item.periodStart
                  )}–${formatDate(item.periodEnd)} · sisa ${formatRupiah(
                    item.total - item.paidAmount
                  )}`,
                }))}
              />
              {invoice ? (
                <FieldDescription>
                  Total {formatRupiah(invoice.total)} · terbayar{" "}
                  {formatRupiah(invoice.paidAmount)} · sisa{" "}
                  {formatRupiah(outstanding)}
                </FieldDescription>
              ) : subscription ? (
                <FieldDescription>
                  Belum ada tagihan. Sistem akan membuat invoice periode
                  berjalan otomatis.
                </FieldDescription>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Cara bayar</p>
                <SelectField
                  value={mode}
                  onValueChange={(value) => setMode(value as "full" | "partial")}
                  ariaLabel="Cara bayar deposit"
                  options={[
                    { value: "full", label: "Lunas" },
                    { value: "partial", label: "Partial" },
                  ]}
                />
              </div>
              <Field>
                <FieldLabel htmlFor="deposit-service-amount">Nominal</FieldLabel>
                <Input
                  id="deposit-service-amount"
                  type="number"
                  min={0}
                  value={mode === "full" ? String(outstanding) : amount}
                  disabled={mode === "full"}
                  onChange={(event) => setAmount(event.target.value)}
                />
                <FieldDescription>
                  {mode === "full" && !invoice
                    ? "Nominal dihitung otomatis dari invoice periode berjalan."
                    : `Nominal efektif: ${formatRupiah(effectiveAmount)}`}
                </FieldDescription>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="deposit-reference">Referensi</FieldLabel>
              <Input
                id="deposit-reference"
                value={reference}
                placeholder="No. transfer / QRIS (opsional)"
                onChange={(event) => setReference(event.target.value)}
              />
            </Field>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={markPending}
                onChange={(event) => setMarkPending(event.target.checked)}
                className="size-4 rounded border-input accent-primary"
              />
              Tandai pending — belum diverifikasi
            </label>
          </>
        ) : (
          <>
            <Field>
              <FieldLabel htmlFor="deposit-payer">Nama penyetor</FieldLabel>
              <Input
                id="deposit-payer"
                value={payerName}
                onChange={(event) => setPayerName(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="deposit-amount">Nominal</FieldLabel>
              <Input
                id="deposit-amount"
                type="number"
                min={0}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </Field>
          </>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="deposit-time">Waktu</FieldLabel>
            <Input
              id="deposit-time"
              type="datetime-local"
              value={paidAt}
              onChange={(event) => setPaidAt(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="deposit-proof">Bukti pembayaran</FieldLabel>
            <Input
              id="deposit-proof"
              type="file"
              accept="image/*,application/pdf"
              onChange={(event) =>
                setProofFileName(event.target.files?.[0]?.name ?? "")
              }
            />
            <FieldDescription>
              Opsional. Hanya nama file yang disimpan.
              {proofFileName ? ` Dipilih: ${proofFileName}` : ""}
            </FieldDescription>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="deposit-notes">Catatan</FieldLabel>
          <Textarea
            id="deposit-notes"
            rows={2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </Field>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onPress={onClose}>
          Batal
        </Button>
        <Button type="button" onPress={save}>
          Simpan deposit
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
