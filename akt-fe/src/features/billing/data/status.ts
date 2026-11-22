import type { StatusTone } from "@/components/shared/StatusBadge";

import type { InvoiceStatus } from "./types";

export const invoiceStatusTone: Record<InvoiceStatus, StatusTone> = {
  draft: "neutral",
  issued: "primary",
  partial: "warning",
  paid: "success",
  overdue: "danger",
  void: "neutral",
};

export const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  draft: "Draft",
  issued: "Diterbitkan",
  partial: "Dibayar sebagian",
  paid: "Lunas",
  overdue: "Terlambat",
  void: "Dibatalkan",
};
