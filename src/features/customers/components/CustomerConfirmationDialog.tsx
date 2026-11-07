"use client";

import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import type { Customer } from "@/features/customers/data/types";

export function CustomerConfirmationDialog({
  customer,
  onConfirm,
  onCancel,
}: {
  customer: Customer | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <ConfirmationDialog
      open={Boolean(customer)}
      title={
        customer?.status === "active"
          ? "Nonaktifkan pelanggan?"
          : "Aktifkan pelanggan?"
      }
      description={
        customer?.status === "active"
          ? "Riwayat tagihan dan data pelanggan tetap disimpan."
          : "Pelanggan akan aktif kembali dan bisa ditagih."
      }
      confirmLabel={customer?.status === "active" ? "Nonaktifkan" : "Aktifkan"}
      destructive={customer?.status === "active"}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
