export type InvoiceStatus =
  | "draft"
  | "issued"
  | "partial"
  | "paid"
  | "overdue"
  | "void";

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
};

export type Invoice = {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  subscriptionId?: string;
  branchName: string;
  periodStart: string;
  periodEnd: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  paidAmount: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
};

export type BillingRun = {
  id: string;
  period: string;
  branchName: string;
  count: number;
  total: number;
  status: "previewed" | "completed";
  createdAt: string;
};
