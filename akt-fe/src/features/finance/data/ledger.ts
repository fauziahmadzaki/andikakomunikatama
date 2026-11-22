import type { FinanceCategory, FinanceMethod } from "./types";

export const CASH_ACCOUNT_IDS = ["acc-1001", "acc-1002", "acc-1004"];

export const CASH_ACCOUNT_BY_METHOD: Record<FinanceMethod, string> = {
  cash: "acc-1001",
  transfer: "acc-1002",
  qris: "acc-1004",
};

export const RECEIVABLE_ACCOUNT_ID = "acc-1003";
export const REVENUE_ACCOUNT_ID = "acc-4001";

export const CATEGORY_ACCOUNT: Record<
  FinanceCategory,
  { accountId: string; side: "debit" | "credit" }
> = {
  service_payment: { accountId: "acc-1003", side: "credit" },
  general_income: { accountId: "acc-4002", side: "credit" },
  salary: { accountId: "acc-5001", side: "debit" },
  equipment: { accountId: "acc-5002", side: "debit" },
  other_expense: { accountId: "acc-5004", side: "debit" },
};

export function isCashAccount(accountId: string) {
  return CASH_ACCOUNT_IDS.includes(accountId);
}
