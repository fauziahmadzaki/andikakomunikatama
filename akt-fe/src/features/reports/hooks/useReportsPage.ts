"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useBranchStore } from "@/features/branches/store/branch-store";
import { useBillingStore } from "@/features/billing/store/billing-store";
import { useCustomerStore } from "@/features/customers/store/customer-store";
import { usePaymentStore } from "@/features/payments/store/payment-store";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription-store";
import { useTicketStore } from "@/features/tickets/store/ticket-store";

export function useReportsPage() {
  const customers = useCustomerStore((state) => state.customers);
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const invoices = useBillingStore((state) => state.invoices);
  const payments = usePaymentStore((state) => state.payments);
  const tickets = useTicketStore((state) => state.tickets);
  const branches = useBranchStore((state) => state.branches);
  const [branchFilter, setBranchFilter] = useState("all");

  const scoped = useMemo(() => {
    if (branchFilter === "all") {
      return { customers, subscriptions, invoices, payments, tickets };
    }
    const branch = branches.find((item) => item.name === branchFilter);
    return {
      customers: customers.filter(
        (customer) => customer.branchId === branch?.id
      ),
      subscriptions: subscriptions.filter(
        (subscription) => subscription.branchId === branch?.id
      ),
      invoices: invoices.filter(
        (invoice) => invoice.branchName === branchFilter
      ),
      payments: payments.filter(
        (payment) => payment.branchName === branchFilter
      ),
      tickets: tickets.filter((ticket) => ticket.branchName === branchFilter),
    };
  }, [branchFilter, branches, customers, invoices, payments, subscriptions, tickets]);

  const revenue = scoped.payments
    .filter(
      (payment) => payment.status === "paid" || payment.status === "partial"
    )
    .reduce((total, payment) => total + payment.paidAmount, 0);
  const outstanding = scoped.invoices.reduce(
    (total, invoice) => total + (invoice.total - invoice.paidAmount),
    0
  );

  const reports = [
    {
      name: "Laporan pelanggan",
      description: "Daftar pelanggan per cabang dan status.",
      value: `${scoped.customers.length} pelanggan`,
      href: "/dashboard/pelanggan",
    },
    {
      name: "Laporan langganan",
      description: "Langganan aktif, isolir, dan terminasi.",
      value: `${scoped.subscriptions.length} langganan`,
      href: "/dashboard/pelanggan",
    },
    {
      name: "Laporan tagihan",
      description: "Invoice issued, overdue, dan outstanding.",
      value: `${scoped.invoices.length} invoice`,
      href: "/dashboard/tagihan",
    },
    {
      name: "Laporan pembayaran",
      description: "Pembayaran terverifikasi dan pending.",
      value: `${scoped.payments.length} pembayaran`,
      href: "/dashboard/pembayaran",
    },
    {
      name: "Laporan tiket",
      description: "Tiket per status dan teknisi.",
      value: `${scoped.tickets.length} tiket`,
      href: "/dashboard/tiket",
    },
  ];

  function exportReport(name: string) {
    toast.success(`${name} diexport (mock).`);
  }

  return {
    branches,
    branchFilter,
    setBranchFilter,
    stats: {
      customers: scoped.customers.length,
      subscriptions: scoped.subscriptions.filter(
        (subscription) => subscription.status === "active"
      ).length,
      revenue,
      outstanding,
      tickets: scoped.tickets.filter((ticket) => ticket.status !== "closed")
        .length,
    },
    reports,
    exportReport,
  };
}
