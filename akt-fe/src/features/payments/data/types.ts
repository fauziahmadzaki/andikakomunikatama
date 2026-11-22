export type PaymentStatus = "pending" | "paid" | "partial" | "rejected" | "void";
export type PaymentMethod = "qris" | "cash" | "transfer";

export type Payment = {
  id: string;
  number: string;
  invoiceId?: string;
  invoiceNumber?: string;
  customerId: string;
  customerName: string;
  branchId?: string;
  branchName: string;
  subscriptionId?: string;
  serviceName: string;
  method: PaymentMethod;
  proofFileName?: string;
  amount: number;
  paidAmount: number;
  status: PaymentStatus;
  paidAt: string;
  reference: string;
  notes: string;
  financeTransactionId?: string;
};

export type ReconciliationRow = {
  id: string;
  reference: string;
  amount: number;
  source: "bank" | "gateway";
  status: "matched" | "unmatched" | "resolved";
  note: string;
};
