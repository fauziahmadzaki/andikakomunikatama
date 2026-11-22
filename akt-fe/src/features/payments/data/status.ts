import type { StatusTone } from "@/components/shared/StatusBadge";

import type { PaymentMethod, PaymentStatus } from "./types";

export const paymentStatusTone: Record<PaymentStatus, StatusTone> = {
  pending: "warning",
  paid: "success",
  partial: "warning",
  rejected: "danger",
  void: "neutral",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Lunas",
  partial: "Belum Lunas",
  rejected: "Ditolak",
  void: "Dibatalkan",
};

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  qris: "QRIS",
  cash: "Cash",
  transfer: "TF",
};
