export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export type JournalSourceType =
  | "manual"
  | "invoice"
  | "payment"
  | "deposit"
  | "withdraw";

export type ChartOfAccount = {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  isActive: boolean;
};

export type JournalLine = {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
};

export type JournalEntry = {
  id: string;
  number: string;
  date: string;
  description: string;
  status: "draft" | "posted" | "void";
  lines: JournalLine[];
  sourceType?: JournalSourceType;
  sourceId?: string;
  reference?: string;
  createdAt?: string;
  voidedAt?: string;
  reversalOfId?: string;
};

export type CashEntry = {
  id: string;
  type: "income" | "expense";
  date: string;
  accountName: string;
  description: string;
  amount: number;
  reference: string;
};

export type FinanceTransactionKind = "deposit" | "withdraw";
export type FinanceCategory =
  | "service_payment"
  | "general_income"
  | "salary"
  | "equipment"
  | "other_expense";
export type FinanceMethod = "qris" | "cash" | "transfer";

export type FinanceTransaction = {
  id: string;
  number: string;
  kind: FinanceTransactionKind;
  category: FinanceCategory;
  direction: "income" | "outcome";
  amount: number;
  paidAt: string;
  method: FinanceMethod;
  branchId?: string;
  branchName?: string;
  customerId?: string;
  customerName?: string;
  payerName?: string;
  paymentId?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  description: string;
  proofFileName?: string;
  createdAt: string;
  journalEntryId?: string;
};
