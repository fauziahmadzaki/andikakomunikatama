import type { StatusTone } from "@/components/shared/StatusBadge";
import type { CustomerStatus } from "./types";

export const customerStatusTone: Record<CustomerStatus, StatusTone> = {
  active: "success",
  suspended: "warning",
  inactive: "neutral",
  draft: "primary",
};

export const customerStatusLabel: Record<CustomerStatus, string> = {
  active: "Aktif",
  suspended: "Isolir",
  inactive: "Nonaktif",
  draft: "Draft",
};

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
