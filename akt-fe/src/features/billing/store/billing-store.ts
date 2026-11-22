import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useAuditStore } from "@/features/audit/store/audit-store";
import { useBranchStore } from "@/features/branches/store/branch-store";
import { useCustomerStore } from "@/features/customers/store/customer-store";
import {
  RECEIVABLE_ACCOUNT_ID,
  REVENUE_ACCOUNT_ID,
} from "@/features/finance/data/ledger";
import { useFinanceStore } from "@/features/finance/store/finance-store";
import { usePlanProfileStore } from "@/features/plan-profiles/store/plan-profile-store";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription-store";
import { periodDueDate, periodEndDate } from "../data/period";
import { seedInvoices } from "../data/seed";
import type { BillingRun, Invoice } from "../data/types";

type GenerateInvoicesInput = {
  subscriptionId: string;
  periods: string[];
};

type GenerateInvoiceResult = {
  created: number;
  skipped: number;
  conflicts: string[];
  invoice?: Invoice;
};

type BillingState = {
  invoices: Invoice[];
  billingRuns: BillingRun[];
  voidInvoice: (id: string) => void;
  applyPayment: (invoiceId: string, amount: number) => Invoice | null;
  generateInvoiceForSubscription: (
    input: GenerateInvoicesInput
  ) => GenerateInvoiceResult;
  resetBilling: () => void;
};

function id() {
  return crypto.randomUUID();
}

function audit(action: string, entityId: string, description: string) {
  useAuditStore.getState().addAudit({
    action,
    entityType: "invoice",
    entityId,
    actor: "Administrator",
    branch: "JKT-01",
    description,
  });
}

function nextInvoiceNumber(count: number) {
  return `INV-2026-${String(8500 + count).padStart(6, "0")}`;
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set, get) => ({
      invoices: seedInvoices,
      billingRuns: [],

      voidInvoice: (invoiceId) => {
        const invoice = get().invoices.find((item) => item.id === invoiceId);
        if (!invoice || invoice.status === "void") {
          return;
        }
        set((state) => ({
          invoices: state.invoices.map((item) =>
            item.id === invoiceId ? { ...item, status: "void" } : item
          ),
        }));
        audit("invoice.voided", invoice.number, `Invoice ${invoice.number} dibatalkan.`);
        useFinanceStore.getState().addSystemJournal({
          date: new Date().toISOString().slice(0, 10),
          description: `Pembatalan invoice ${invoice.number} — ${invoice.customerName}`,
          reference: invoice.number,
          sourceType: "invoice",
          sourceId: invoice.id,
          lines: [
            {
              accountId: REVENUE_ACCOUNT_ID,
              debit: invoice.total,
              credit: 0,
            },
            {
              accountId: RECEIVABLE_ACCOUNT_ID,
              debit: 0,
              credit: invoice.total,
            },
          ],
        });
      },

      applyPayment: (invoiceId, amount) => {
        const invoice = get().invoices.find((item) => item.id === invoiceId);
        if (!invoice || invoice.status === "void" || amount <= 0) {
          return null;
        }
        const paidAmount = Math.min(
          invoice.total,
          invoice.paidAmount + amount
        );
        const status = paidAmount >= invoice.total ? "paid" : "partial";
        const updated: Invoice = { ...invoice, paidAmount, status };

        set((state) => ({
          invoices: state.invoices.map((item) =>
            item.id === invoiceId ? updated : item
          ),
        }));
        audit(
          "invoice.payment_applied",
          invoice.number,
          `Pembayaran ${amount} diterapkan ke ${invoice.number}.`
        );
        return updated;
      },

      generateInvoiceForSubscription: ({ subscriptionId, periods }) => {
        const subscription = useSubscriptionStore
          .getState()
          .subscriptions.find((item) => item.id === subscriptionId);

        if (!subscription) {
          return { created: 0, skipped: 0, conflicts: [] };
        }

        const uniquePeriods = [...new Set(periods)].filter(Boolean).sort();
        if (uniquePeriods.length === 0) {
          return { created: 0, skipped: 0, conflicts: [] };
        }

        const conflicts = uniquePeriods.filter((period) =>
          get().invoices.some(
            (invoice) =>
              invoice.periodStart.startsWith(period) &&
              invoice.status !== "void" &&
              (invoice.subscriptionId === subscription.id ||
                (!invoice.subscriptionId &&
                  invoice.customerId === subscription.customerId))
          )
        );

        if (conflicts.length > 0) {
          return { created: 0, skipped: conflicts.length, conflicts };
        }

        const branches = useBranchStore.getState().branches;
        const customers = useCustomerStore.getState().customers;
        const packages = usePlanProfileStore.getState().profiles;
        const customer = customers.find(
          (item) => item.id === subscription.customerId
        );
        const branchName =
          branches.find((item) => item.id === subscription.branchId)?.name ??
          "-";
        const plan = packages.find((item) => item.id === subscription.planId);
        const price = subscription.priceSnapshot;
        const taxPerPeriod = subscription.taxEnabled ? (price * 11) / 100 : 0;
        const count = uniquePeriods.length;
        const firstPeriod = uniquePeriods[0];
        const lastPeriod = uniquePeriods[count - 1];
        const subtotal = price * count;
        const taxTotal = taxPerPeriod * count;
        const invoice: Invoice = {
          id: id(),
          number: nextInvoiceNumber(get().invoices.length),
          customerId: subscription.customerId,
          customerName: customer?.fullName ?? "-",
          subscriptionId: subscription.id,
          branchName,
          periodStart: `${firstPeriod}-01`,
          periodEnd: periodEndDate(lastPeriod),
          issueDate: new Date().toISOString().slice(0, 10),
          dueDate: periodDueDate(firstPeriod, subscription.dueDay),
          subtotal,
          discountTotal: 0,
          taxTotal,
          total: subtotal + taxTotal,
          paidAmount: 0,
          status: "issued",
          items: [
            {
              id: id(),
              description: `${plan?.name ?? "Paket"} — ${firstPeriod} s.d. ${lastPeriod} (${count} periode)`,
              quantity: count,
              unitPrice: price,
              discountAmount: 0,
              taxAmount: taxTotal,
              total: subtotal + taxTotal,
            },
          ],
        };

        set((state) => ({
          invoices: [invoice, ...state.invoices],
          billingRuns: [
            {
              id: id(),
              period:
                count === 1 ? firstPeriod : `${firstPeriod}..${lastPeriod}`,
              branchName,
              count: 1,
              total: invoice.total,
              status: "completed",
              createdAt: new Date().toISOString(),
            },
            ...state.billingRuns,
          ],
        }));
        audit(
          "invoice.generated",
          invoice.number,
          `Invoice ${invoice.number} dibuat untuk ${subscription.number} (${count} periode).`
        );

        useFinanceStore.getState().addSystemJournal({
          date: invoice.issueDate,
          description: `Invoice ${invoice.number} — ${invoice.customerName}`,
          reference: invoice.number,
          sourceType: "invoice",
          sourceId: invoice.id,
          lines: [
            {
              accountId: RECEIVABLE_ACCOUNT_ID,
              debit: invoice.total,
              credit: 0,
            },
            {
              accountId: REVENUE_ACCOUNT_ID,
              debit: 0,
              credit: invoice.total,
            },
          ],
        });

        return { created: 1, skipped: 0, conflicts: [], invoice };
      },

      resetBilling: () => set({ invoices: seedInvoices, billingRuns: [] }),
    }),
    { name: "muranet-billing", skipHydration: true }
  )
);
