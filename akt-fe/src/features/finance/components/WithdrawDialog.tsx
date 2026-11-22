"use client";

import { SelectField } from "@/components/shared/SelectField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { withdrawCategoryOptions } from "@/features/finance/data/labels";
import type { FinanceCategory } from "@/features/finance/data/types";
import { useWithdrawDialog } from "@/features/finance/hooks/useFinance";
import type { PaymentMethod } from "@/features/payments/data/types";

const methodOptions = [
  { value: "qris", label: "QRIS" },
  { value: "cash", label: "Cash" },
  { value: "transfer", label: "TF" },
];

export function WithdrawDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    branches,
    category,
    setCategory,
    amount,
    setAmount,
    method,
    setMethod,
    paidAt,
    setPaidAt,
    proofFileName,
    setProofFileName,
    branchId,
    setBranchId,
    notes,
    setNotes,
    save,
  } = useWithdrawDialog({ onClose });

  return (
    <Dialog
      isOpen={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      className="sm:max-w-2xl"
    >
      <DialogHeader>
        <DialogTitle>Withdraw</DialogTitle>
        <DialogDescription>
          Catat pengeluaran operasional perusahaan.
        </DialogDescription>
      </DialogHeader>

      <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Jenis pengeluaran</p>
            <SelectField
              value={category}
              onValueChange={(value) =>
                setCategory(value as FinanceCategory)
              }
              ariaLabel="Jenis pengeluaran"
              options={withdrawCategoryOptions}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Cabang</p>
            <SelectField
              value={branchId}
              onValueChange={setBranchId}
              ariaLabel="Cabang pengeluaran"
              options={[
                { value: "all", label: "Semua cabang" },
                ...branches.map((branch) => ({
                  value: branch.id,
                  label: branch.name,
                })),
              ]}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="withdraw-amount">Nominal</FieldLabel>
            <Input
              id="withdraw-amount"
              type="number"
              min={0}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </Field>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Metode pengeluaran</p>
            <SelectField
              value={method}
              onValueChange={(value) => setMethod(value as PaymentMethod)}
              ariaLabel="Metode pengeluaran"
              options={methodOptions}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="withdraw-time">Waktu</FieldLabel>
            <Input
              id="withdraw-time"
              type="datetime-local"
              value={paidAt}
              onChange={(event) => setPaidAt(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="withdraw-proof">Bukti</FieldLabel>
            <Input
              id="withdraw-proof"
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
          <FieldLabel htmlFor="withdraw-notes">Catatan</FieldLabel>
          <Textarea
            id="withdraw-notes"
            rows={2}
            value={notes}
            placeholder="Contoh: Gaji teknisi November"
            onChange={(event) => setNotes(event.target.value)}
          />
        </Field>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onPress={onClose}>
          Batal
        </Button>
        <Button type="button" onPress={save}>
          Simpan withdraw
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
