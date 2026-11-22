import { currentPeriod } from "@/features/billing/data/period";
import type { Invoice } from "@/features/billing/data/types";
import { useBillingStore } from "@/features/billing/store/billing-store";
import { useBranchStore } from "@/features/branches/store/branch-store";
import { useCustomerStore } from "@/features/customers/store/customer-store";
import { useFinanceStore } from "@/features/finance/store/finance-store";
import type { Payment, PaymentMethod } from "@/features/payments/data/types";
import { usePaymentStore } from "@/features/payments/store/payment-store";
import { usePlanProfileStore } from "@/features/plan-profiles/store/plan-profile-store";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription-store";

export type RecordServicePaymentInput = {
  customerId: string;
  invoiceId?: string;
  mode: "full" | "partial";
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  proofFileName?: string;
  reference?: string;
  notes?: string;
  markPending?: boolean;
};

export type RecordServicePaymentResult =
  | {
      ok: true;
      payment: Payment;
      invoice: Invoice;
    }
  | { ok: false; message: string };

function resolveInvoice({
  customerId,
  invoiceId,
}: {
  customerId: string;
  invoiceId?: string;
}) {
  const billing = useBillingStore.getState();
  const subscriptions = useSubscriptionStore.getState().subscriptions;
  const subscription = subscriptions.find(
    (item) =>
      item.customerId === customerId && item.status !== "terminated"
  );

  if (invoiceId) {
    const invoice = billing.invoices.find((item) => item.id === invoiceId);
    if (invoice && invoice.status !== "void") {
      return { invoice, subscription };
    }
  }

  if (!subscription) {
    return { invoice: undefined, subscription: undefined };
  }

  const period = currentPeriod();
  const existing = billing.invoices.find(
    (invoice) =>
      invoice.status !== "void" &&
      invoice.subscriptionId === subscription.id &&
      invoice.periodStart.startsWith(period) &&
      invoice.total > invoice.paidAmount
  );
  if (existing) {
    return { invoice: existing, subscription };
  }

  const outstanding = billing.invoices
    .filter(
      (invoice) =>
        invoice.status !== "void" &&
        invoice.customerId === customerId &&
        invoice.total > invoice.paidAmount
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  if (outstanding) {
    return { invoice: outstanding, subscription };
  }

  const generated = billing.generateInvoiceForSubscription({
    subscriptionId: subscription.id,
    periods: [period],
  });

  return { invoice: generated.invoice, subscription };
}

export function recordServicePayment(
  input: RecordServicePaymentInput
): RecordServicePaymentResult {
  const customers = useCustomerStore.getState().customers;
  const customer = customers.find((item) => item.id === input.customerId);
  if (!customer) {
    return { ok: false, message: "Pelanggan tidak ditemukan." };
  }

  const { invoice, subscription } = resolveInvoice({
    customerId: input.customerId,
    invoiceId: input.invoiceId,
  });

  if (!invoice || !subscription) {
    return {
      ok: false,
      message: "Invoice atau langganan pelanggan tidak ditemukan.",
    };
  }

  const outstanding = invoice.total - invoice.paidAmount;
  if (outstanding <= 0) {
    return { ok: false, message: "Invoice ini sudah lunas." };
  }

  const amount =
    input.mode === "full" ? outstanding : Math.round(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, message: "Nominal pembayaran tidak valid." };
  }
  if (amount > outstanding) {
    return {
      ok: false,
      message: "Nominal pembayaran melebihi sisa tagihan.",
    };
  }

  const plans = usePlanProfileStore.getState().profiles;
  const branches = useBranchStore.getState().branches;
  const serviceName =
    plans.find((plan) => plan.id === subscription.planId)?.name ??
    "Layanan internet";
  const branchName =
    branches.find((branch) => branch.id === customer.branchId)?.name ?? "-";
  const parsedPaidAt = new Date(input.paidAt);
  if (Number.isNaN(parsedPaidAt.getTime())) {
    return { ok: false, message: "Waktu pembayaran tidak valid." };
  }
  const paidAt = parsedPaidAt.toISOString();

  if (input.markPending) {
    const pendingPayment = usePaymentStore.getState().addPayment({
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      customerId: customer.id,
      customerName: customer.fullName,
      branchId: customer.branchId,
      branchName,
      subscriptionId: subscription.id,
      serviceName,
      method: input.method,
      proofFileName: input.proofFileName,
      amount,
      paidAmount: 0,
      status: "pending",
      paidAt,
      reference: input.reference?.trim() || "-",
      notes: input.notes?.trim() ?? "",
    });
    return { ok: true, payment: pendingPayment, invoice };
  }

  const updatedInvoice = useBillingStore
    .getState()
    .applyPayment(invoice.id, amount);
  if (!updatedInvoice) {
    return { ok: false, message: "Pembayaran gagal diterapkan ke invoice." };
  }

  const payment = usePaymentStore.getState().addPayment({
    invoiceId: invoice.id,
    invoiceNumber: invoice.number,
    customerId: customer.id,
    customerName: customer.fullName,
    branchId: customer.branchId,
    branchName,
    subscriptionId: subscription.id,
    serviceName,
    method: input.method,
    proofFileName: input.proofFileName,
    amount,
    paidAmount: updatedInvoice.paidAmount,
    status: updatedInvoice.status === "paid" ? "paid" : "partial",
    paidAt,
    reference: input.reference?.trim() || "-",
    notes: input.notes?.trim() ?? "",
  });
  const transaction = useFinanceStore.getState().addTransaction({
    kind: "deposit",
    category: "service_payment",
    direction: "income",
    amount,
    paidAt,
    method: input.method,
    branchId: customer.branchId,
    branchName,
    customerId: customer.id,
    customerName: customer.fullName,
    paymentId: payment.id,
    invoiceId: invoice.id,
    invoiceNumber: invoice.number,
    description: `Pembayaran layanan ${serviceName} — ${invoice.number}`,
    proofFileName: input.proofFileName,
  });

  usePaymentStore.getState().updatePayment(payment.id, {
    financeTransactionId: transaction.id,
  });

  return {
    ok: true,
    payment: { ...payment, financeTransactionId: transaction.id },
    invoice: updatedInvoice,
  };
}

export function verifyServicePayment(paymentId: string) {
  const payment = usePaymentStore
    .getState()
    .payments.find((item) => item.id === paymentId);
  if (!payment) {
    return { ok: false as const, message: "Pembayaran tidak ditemukan." };
  }
  if (payment.status !== "pending") {
    return { ok: false as const, message: "Pembayaran tidak menunggu verifikasi." };
  }
  if (!payment.invoiceId) {
    return { ok: false as const, message: "Pembayaran tidak terhubung ke invoice." };
  }

  const invoice = useBillingStore
    .getState()
    .invoices.find((item) => item.id === payment.invoiceId);
  if (!invoice || invoice.status === "void") {
    return { ok: false as const, message: "Invoice tidak valid." };
  }

  const outstanding = invoice.total - invoice.paidAmount;
  const amount = Math.min(payment.amount, outstanding);
  const updatedInvoice = useBillingStore
    .getState()
    .applyPayment(invoice.id, amount);
  if (!updatedInvoice) {
    return { ok: false as const, message: "Pembayaran gagal diterapkan." };
  }

  const transaction = useFinanceStore.getState().addTransaction({
    kind: "deposit",
    category: "service_payment",
    direction: "income",
    amount,
    paidAt: payment.paidAt,
    method: payment.method,
    branchId: payment.branchId,
    branchName: payment.branchName,
    customerId: payment.customerId,
    customerName: payment.customerName,
    paymentId: payment.id,
    invoiceId: invoice.id,
    invoiceNumber: invoice.number,
    description: `Pembayaran layanan ${payment.serviceName} — ${invoice.number}`,
    proofFileName: payment.proofFileName,
  });

  usePaymentStore.getState().updatePayment(payment.id, {
    status: updatedInvoice.status === "paid" ? "paid" : "partial",
    paidAmount: updatedInvoice.paidAmount,
    financeTransactionId: transaction.id,
  });

  return { ok: true as const, paymentId };
}

export function rejectServicePayment(paymentId: string) {
  usePaymentStore.getState().updatePayment(paymentId, {
    status: "rejected",
  });
  return { ok: true as const, paymentId };
}
