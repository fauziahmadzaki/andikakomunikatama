import type { StatusTone } from "@/components/shared/StatusBadge";

import type {
  AccountType,
  JournalSourceType,
  JournalEntry,
} from "./types";

export const accountTypeLabel: Record<AccountType, string> = {
  asset: "Aset",
  liability: "Liabilitas",
  equity: "Ekuitas",
  revenue: "Pendapatan",
  expense: "Beban",
};

export const journalStatusTone: Record<JournalEntry["status"], StatusTone> = {
  draft: "neutral",
  posted: "success",
  void: "danger",
};

export const journalStatusLabel: Record<JournalEntry["status"], string> = {
  draft: "Draft",
  posted: "Diposting",
  void: "Dibatalkan",
};

export const journalSourceLabel: Record<JournalSourceType, string> = {
  manual: "Manual",
  invoice: "Invoice",
  payment: "Pembayaran",
  deposit: "Deposit",
  withdraw: "Withdraw",
};
