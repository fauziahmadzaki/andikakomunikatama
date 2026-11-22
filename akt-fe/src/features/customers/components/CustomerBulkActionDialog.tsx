"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { SelectField } from "@/components/shared/SelectField";
import { Textarea } from "@/components/ui/textarea";
import type { CustomerBulkAction } from "@/features/customers/hooks/useCustomersPage";

const titles: Record<CustomerBulkAction, (count: number) => string> = {
  activate: (count) => `Aktifkan ${count} pelanggan?`,
  isolate: (count) => `Isolir ${count} pelanggan?`,
  deactivate: (count) => `Nonaktifkan ${count} pelanggan?`,
  migrate: (count) => `Migrasikan ${count} pelanggan?`,
  delete: (count) => `Hapus ${count} pelanggan?`,
};

const descriptions: Record<CustomerBulkAction, string> = {
  activate:
    "Pelanggan dan langganan yang tersedia akan diaktifkan kembali.",
  isolate:
    "Langganan aktif akan diisolir sementara. Isi alasan isolir di bawah.",
  deactivate:
    "Pelanggan akan dinonaktifkan dan langganan aktif akan diisolir.",
  migrate:
    "Langganan aktif milik pelanggan terpilih akan dipindahkan ke paket target.",
  delete:
    "Data pelanggan, alamat, kontak, identitas, dan akun portal akan dihapus. Langganan terkait akan diterminasi. Riwayat tagihan tetap disimpan.",
};

const confirmLabels: Record<CustomerBulkAction, string> = {
  activate: "Aktifkan",
  isolate: "Isolir",
  deactivate: "Nonaktifkan",
  migrate: "Migrasikan",
  delete: "Hapus",
};

export function CustomerBulkActionDialog({
  action,
  count,
  reason,
  onReasonChange,
  targetPlanId,
  onTargetPlanChange,
  targetOptions,
  onConfirm,
  onCancel,
}: {
  action: CustomerBulkAction | null;
  count: number;
  reason: string;
  onReasonChange: (value: string) => void;
  targetPlanId: string;
  onTargetPlanChange: (value: string) => void;
  targetOptions: Array<{ value: string; label: string }>;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!action) {
    return null;
  }

  return (
    <Dialog isOpen onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogHeader>
        <DialogTitle>{titles[action](count)}</DialogTitle>
        <DialogDescription>{descriptions[action]}</DialogDescription>
      </DialogHeader>

      {action === "isolate" ? (
        <Field>
          <FieldLabel htmlFor="bulk-isolate-reason">Alasan isolir</FieldLabel>
          <Textarea
            id="bulk-isolate-reason"
            rows={2}
            value={reason}
            placeholder="Contoh: Tunggakan lebih dari 1 bulan."
            onChange={(event) => onReasonChange(event.target.value)}
          />
        </Field>
      ) : null}

      {action === "migrate" ? (
        <Field>
          <FieldLabel>Paket target</FieldLabel>
          <SelectField
            value={targetPlanId}
            onValueChange={onTargetPlanChange}
            ariaLabel="Paket target migrasi"
            placeholder="Pilih paket target"
            options={targetOptions}
          />
          {targetOptions.length === 0 ? (
            <p className="text-xs text-destructive">
              Belum ada paket aktif untuk dijadikan target.
            </p>
          ) : null}
        </Field>
      ) : null}

      <DialogFooter>
        <Button type="button" variant="outline" onPress={onCancel}>
          Batal
        </Button>
        <Button
          type="button"
          variant={action === "delete" ? "destructive" : "default"}
          isDisabled={action === "migrate" && !targetPlanId}
          onPress={onConfirm}
        >
          {confirmLabels[action]}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
