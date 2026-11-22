"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useBranchStore } from "@/features/branches/store/branch-store";
import type { Payment, PaymentMethod, PaymentStatus } from "@/features/payments/data/types";
import {
  rejectServicePayment,
  verifyServicePayment,
} from "@/features/payments/services/recordServicePayment";
import { usePaymentStore } from "@/features/payments/store/payment-store";

function jakartaDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function usePaymentsPage() {
  const payments = usePaymentStore((state) => state.payments);
  const branches = useBranchStore((state) => state.branches).filter(
    (branch) => branch.isActive
  );
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState<"all" | PaymentMethod>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [detail, setDetail] = useState<Payment | null>(null);
  const [confirm, setConfirm] = useState<{
    payment: Payment;
    action: "verify" | "reject";
  } | null>(null);

  const filtered = useMemo(
    () =>
      payments.filter((payment) => {
        const haystack = `${payment.number} ${
          payment.invoiceNumber ?? ""
        } ${payment.customerName} ${payment.serviceName} ${
          payment.reference
        }`.toLowerCase();
        const matchesQuery =
          !query || haystack.includes(query.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || payment.status === statusFilter;
        const matchesBranch =
          branchFilter === "all" || payment.branchId === branchFilter;
        const matchesMethod =
          methodFilter === "all" || payment.method === methodFilter;
        const date = jakartaDate(payment.paidAt);
        const matchesFrom = !dateFrom || date >= dateFrom;
        const matchesTo = !dateTo || date <= dateTo;
        return (
          matchesQuery &&
          matchesStatus &&
          matchesBranch &&
          matchesMethod &&
          matchesFrom &&
          matchesTo
        );
      }),
    [
      branchFilter,
      dateFrom,
      dateTo,
      methodFilter,
      payments,
      query,
      statusFilter,
    ]
  );

  const stats = useMemo(
    () => ({
      total: filtered.length,
      paid: filtered.filter((payment) => payment.status === "paid").length,
      pending: filtered.filter((payment) => payment.status === "pending").length,
      partial: filtered.filter((payment) => payment.status === "partial").length,
      amount: filtered.reduce((total, payment) => total + payment.amount, 0),
      paidAmount: filtered.reduce(
        (total, payment) => total + payment.paidAmount,
        0
      ),
    }),
    [filtered]
  );

  function resetFilters() {
    setQuery("");
    setStatusFilter("all");
    setBranchFilter("all");
    setMethodFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  function confirmAction() {
    if (!confirm) {
      return;
    }
    if (confirm.action === "verify") {
      const result = verifyServicePayment(confirm.payment.id);
      if (result.ok) {
        toast.success("Pembayaran diverifikasi dan invoice diperbarui.");
      } else {
        toast.error(result.message);
      }
    } else {
      rejectServicePayment(confirm.payment.id);
      toast.success("Pembayaran ditolak.");
    }
    setConfirm(null);
  }

  return {
    payments: filtered,
    branches,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    branchFilter,
    setBranchFilter,
    methodFilter,
    setMethodFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    resetFilters,
    stats,
    detail,
    setDetail,
    confirm,
    setConfirm,
    confirmAction,
  };
}

export function useReconciliationPage() {
  const rows = usePaymentStore((state) => state.reconciliation);
  const resolve = usePaymentStore((state) => state.resolveReconciliation);
  return {
    rows,
    resolve: (id: string) => {
      resolve(id);
      toast.success("Rekonsiliasi diselesaikan.");
    },
  };
}
