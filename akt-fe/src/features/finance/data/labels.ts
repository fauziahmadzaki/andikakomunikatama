import type {
  FinanceCategory,
  FinanceMethod,
  FinanceTransactionKind,
} from "./types";

export const financeKindLabel: Record<FinanceTransactionKind, string> = {
  deposit: "Deposit",
  withdraw: "Withdraw",
};

export const financeCategoryLabel: Record<FinanceCategory, string> = {
  service_payment: "Pembayaran layanan",
  general_income: "Pemasukan lainnya",
  salary: "Gaji",
  equipment: "Pembelian alat",
  other_expense: "Pengeluaran lainnya",
};

export const financeMethodLabel: Record<FinanceMethod, string> = {
  qris: "QRIS",
  cash: "Cash",
  transfer: "TF",
};

export const withdrawCategoryOptions: Array<{
  value: FinanceCategory;
  label: string;
}> = [
  { value: "salary", label: "Gaji" },
  { value: "equipment", label: "Pembelian alat" },
  { value: "other_expense", label: "Lainnya" },
];
