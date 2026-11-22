import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateUUID } from "@/lib/uuid";

import { useAuditStore } from "@/features/audit/store/audit-store";
import { seedPayments, seedReconciliation } from "../data/seed";
import type {
  Payment,
  PaymentMethod,
  PaymentStatus,
  ReconciliationRow,
} from "../data/types";

type NewPayment = Omit<Payment, "id" | "number">;

type PaymentsState = {
  payments: Payment[];
  reconciliation: ReconciliationRow[];
  addPayment: (input: NewPayment) => Payment;
  updatePayment: (id: string, patch: Partial<Payment>) => void;
  resolveReconciliation: (id: string) => void;
  resetPayments: () => void;
};

function id() {
  return generateUUID();
}

function audit(action: string, entityId: string, description: string) {
  useAuditStore.getState().addAudit({
    action,
    entityType: "payment",
    entityId,
    actor: "Administrator",
    branch: "JKT-01",
    description,
  });
}

function normalizeMethod(method: string): PaymentMethod {
  if (method === "cash") {
    return "cash";
  }
  if (method === "payment_gateway" || method === "qris") {
    return "qris";
  }
  return "transfer";
}

function normalizeStatus(status: string): PaymentStatus {
  if (status === "paid" || status === "verified") {
    return "paid";
  }
  if (status === "partial") {
    return "partial";
  }
  if (status === "rejected") {
    return "rejected";
  }
  if (status === "void") {
    return "void";
  }
  return "pending";
}

export const usePaymentStore = create<PaymentsState>()(
  persist(
    (set, get) => ({
      payments: seedPayments,
      reconciliation: seedReconciliation,

      addPayment: (input) => {
        const payment: Payment = {
          ...input,
          id: id(),
          number: `PAY-2026-${String(9000 + get().payments.length).padStart(
            6,
            "0"
          )}`,
        };
        set((state) => ({ payments: [payment, ...state.payments] }));
        audit(
          "payment.created",
          payment.number,
          `Pembayaran ${payment.number} dicatat.`
        );
        return payment;
      },

      updatePayment: (paymentId, patch) => {
        set((state) => ({
          payments: state.payments.map((payment) =>
            payment.id === paymentId ? { ...payment, ...patch } : payment
          ),
        }));
        const payment = get().payments.find((item) => item.id === paymentId);
        audit(
          "payment.updated",
          payment?.number ?? paymentId,
          `Pembayaran ${payment?.number ?? paymentId} diperbarui.`
        );
      },

      resolveReconciliation: (rowId) => {
        set((state) => ({
          reconciliation: state.reconciliation.map((row) =>
            row.id === rowId ? { ...row, status: "resolved" } : row
          ),
        }));
        audit("reconciliation.resolved", rowId, "Baris rekonsiliasi diselesaikan.");
      },

      resetPayments: () =>
        set({
          payments: seedPayments,
          reconciliation: seedReconciliation,
        }),
    }),
    {
      name: "muranet-payments",
      skipHydration: true,
      version: 1,
      migrate: (persistedState) => {
        const state = (persistedState ?? {}) as Partial<PaymentsState> & {
          payments?: Array<Record<string, unknown>>;
        };
        const payments = Array.isArray(state.payments)
          ? state.payments.map((payment) => {
              const status = normalizeStatus(String(payment.status ?? "pending"));
              const amount = Number(payment.amount ?? 0);
              const method = normalizeMethod(String(payment.method ?? "cash"));
              const rawPaidAt = payment.paidAt
                ? String(payment.paidAt)
                : "";
              const paidAt = rawPaidAt
                ? rawPaidAt.includes("T")
                  ? rawPaidAt
                  : `${rawPaidAt}T09:00:00+07:00`
                : new Date().toISOString();
              return {
                id: String(payment.id ?? id()),
                number: String(payment.number ?? "PAY-2026-000000"),
                invoiceId: payment.invoiceId as string | undefined,
                invoiceNumber:
                  (payment.invoiceNumber as string | undefined) ?? "-",
                customerId: String(payment.customerId ?? ""),
                customerName: String(payment.customerName ?? "-"),
                branchId: payment.branchId as string | undefined,
                branchName: String(payment.branchName ?? "-"),
                subscriptionId: payment.subscriptionId as string | undefined,
                serviceName: String(payment.serviceName ?? "Layanan internet"),
                method,
                proofFileName: payment.proofFileName as string | undefined,
                amount,
                paidAmount:
                  status === "paid" || status === "partial"
                    ? Number(payment.paidAmount ?? amount)
                    : 0,
                status,
                paidAt,
                reference: String(payment.reference ?? "-"),
                notes: String(payment.notes ?? ""),
              } satisfies Payment;
            })
          : seedPayments;

        return {
          ...state,
          payments,
          reconciliation: Array.isArray(state.reconciliation)
            ? state.reconciliation
            : seedReconciliation,
        } as PaymentsState;
      },
    }
  )
);
