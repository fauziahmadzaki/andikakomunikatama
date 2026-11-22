"use client";

import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import type { CustomerView } from "@/features/customers/data/types";

export function CustomerConfirmationDialog({
  customer,
  onConfirm,
  onCancel,
}: {
  customer: CustomerView | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <ConfirmationDialog
      open={Boolean(customer)}
      title={
        customer?.status === "active"
          ? "Isolir pelanggan?"
          : "Aktifkan pelanggan?"
      }
      description={
        customer?.status === "active"
          ? "Langganan aktif akan diisolir dan layanan pelanggan dihentikan sementara."
          : "Pelanggan akan aktif kembali beserta langganan yang tersedia."
      }
      confirmLabel={customer?.status === "active" ? "Isolir" : "Aktifkan"}
      destructive={customer?.status === "active"}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
