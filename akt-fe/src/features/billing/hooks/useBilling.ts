"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useBranchStore } from "@/features/branches/store/branch-store";
import { useBillingStore } from "@/features/billing/store/billing-store";
import {
  addMonths,
  currentPeriod,
  resolvePeriods,
  type BillingRunPeriodMode,
} from "@/features/billing/data/period";
import { useCustomerStore } from "@/features/customers/store/customer-store";
import { usePlanProfileStore } from "@/features/plan-profiles/store/plan-profile-store";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription-store";

export function useInvoicesPage() {
  const invoices = useBillingStore((state) => state.invoices);
  const voidInvoice = useBillingStore((state) => state.voidInvoice);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [todayPeriod] = useState(() => currentPeriod());
  const [periodFilter, setPeriodFilter] = useState("current");
  const [customPeriodStart, setCustomPeriodStart] = useState(() =>
    addMonths(currentPeriod(), -2)
  );
  const [customPeriodEnd, setCustomPeriodEnd] = useState(() =>
    currentPeriod()
  );
  const [confirmInvoiceId, setConfirmInvoiceId] = useState<string | null>(null);

  const periodBounds = useMemo(() => {
    if (periodFilter === "current") {
      return { start: todayPeriod, end: todayPeriod };
    }
    if (periodFilter === "last3") {
      return { start: addMonths(todayPeriod, -2), end: todayPeriod };
    }
    if (periodFilter === "custom") {
      return customPeriodStart <= customPeriodEnd
        ? { start: customPeriodStart, end: customPeriodEnd }
        : { start: customPeriodEnd, end: customPeriodStart };
    }
    return null;
  }, [customPeriodEnd, customPeriodStart, periodFilter, todayPeriod]);

  const filtered = useMemo(
    () =>
      invoices.filter((invoice) => {
        const matchesQuery =
          !query ||
          `${invoice.number} ${invoice.customerName}`
            .toLowerCase()
            .includes(query.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || invoice.status === statusFilter;
        const invoicePeriod = invoice.periodStart.slice(0, 7);
        const matchesPeriod =
          !periodBounds ||
          (invoicePeriod >= periodBounds.start &&
            invoicePeriod <= periodBounds.end);
        return matchesQuery && matchesStatus && matchesPeriod;
      }),
    [invoices, periodBounds, query, statusFilter]
  );

  const stats = useMemo(
    () => ({
      total: filtered.length,
      issued: filtered.filter((invoice) => invoice.status === "issued").length,
      overdue: filtered.filter((invoice) => invoice.status === "overdue").length,
      outstanding: filtered.reduce(
        (total, invoice) => total + (invoice.total - invoice.paidAmount),
        0
      ),
    }),
    [filtered]
  );

  function confirmVoid() {
    if (!confirmInvoiceId) {
      return;
    }
    voidInvoice(confirmInvoiceId);
    toast.success("Invoice dibatalkan.");
    setConfirmInvoiceId(null);
  }

  return {
    invoices: filtered,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    periodFilter,
    setPeriodFilter,
    customPeriodStart,
    setCustomPeriodStart,
    customPeriodEnd,
    setCustomPeriodEnd,
    stats,
    confirmInvoiceId,
    setConfirmInvoiceId,
    confirmVoid,
  };
}

export function useInvoiceDetail(id: string) {
  const invoices = useBillingStore((state) => state.invoices);
  const voidInvoice = useBillingStore((state) => state.voidInvoice);
  const invoice = invoices.find((item) => item.id === id);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function confirmVoid() {
    if (!invoice) {
      return;
    }
    voidInvoice(invoice.id);
    toast.success("Invoice dibatalkan.");
    setConfirmOpen(false);
  }

  return { invoice, confirmOpen, setConfirmOpen, confirmVoid };
}

export function useBillingRun() {
  const customers = useCustomerStore((state) => state.customers);
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const services = useSubscriptionStore((state) => state.services);
  const packages = usePlanProfileStore((state) => state.profiles);
  const branches = useBranchStore((state) => state.branches);
  const invoices = useBillingStore((state) => state.invoices);
  const generateInvoice = useBillingStore(
    (state) => state.generateInvoiceForSubscription
  );

  const billableSubscriptions = subscriptions.filter(
    (subscription) =>
      subscription.status === "active" || subscription.status === "suspended"
  );
  const initialCustomer =
    customers.find((customer) =>
      billableSubscriptions.some(
        (subscription) => subscription.customerId === customer.id
      )
    ) ?? customers[0];
  const [customerId, setCustomerId] = useState(initialCustomer?.id ?? "");
  const [mode, setMode] = useState<BillingRunPeriodMode>("unbilled");
  const [startPeriod, setStartPeriod] = useState(() => currentPeriod());
  const [count, setCount] = useState("3");
  const [result, setResult] = useState<{
    created: number;
    skipped: number;
    conflicts: string[];
  } | null>(null);

  const customer = customers.find((item) => item.id === customerId);
  const customerSubscriptions = billableSubscriptions.filter(
    (subscription) => subscription.customerId === customerId
  );
  const subscription = customerSubscriptions[0];
  const plan = packages.find((item) => item.id === subscription?.planId);
  const branchName =
    branches.find((item) => item.id === subscription?.branchId)?.name ?? "-";
  const subscriptionServices = services.filter(
    (service) => service.subscriptionId === subscription?.id
  );

  const billedPeriods = useMemo(() => {
    if (!subscription) {
      return new Set<string>();
    }
    return new Set(
      invoices
        .filter(
          (invoice) =>
            invoice.status !== "void" &&
            (invoice.subscriptionId === subscription.id ||
              (!invoice.subscriptionId &&
                invoice.customerId === subscription.customerId))
        )
        .map((invoice) => invoice.periodStart.slice(0, 7))
    );
  }, [invoices, subscription]);

  const intendedPeriods = useMemo(() => {
    if (!subscription) {
      return [];
    }
    return resolvePeriods({
      mode,
      startPeriod,
      count: Number(count),
      subscriptionStart: subscription.startDate,
    });
  }, [count, mode, startPeriod, subscription]);

  const periodsToCreate = useMemo(
    () => intendedPeriods.filter((period) => !billedPeriods.has(period)),
    [billedPeriods, intendedPeriods]
  );
  const skippedPeriods = useMemo(
    () => intendedPeriods.filter((period) => billedPeriods.has(period)),
    [billedPeriods, intendedPeriods]
  );
  const unitPrice = subscription?.priceSnapshot ?? 0;
  const taxAmount = subscription?.taxEnabled ? (unitPrice * 11) / 100 : 0;
  const estimatedTotal = (unitPrice + taxAmount) * periodsToCreate.length;

  function selectCustomer(nextCustomerId: string) {
    setCustomerId(nextCustomerId);
    setResult(null);
  }

  function commit() {
    if (!subscription) {
      toast.error("Pilih pelanggan dan layanan terlebih dahulu.");
      return;
    }
    if (periodsToCreate.length === 0) {
      toast.error("Tidak ada periode yang perlu ditagih.");
      return;
    }

    const outcome = generateInvoice({
      subscriptionId: subscription.id,
      periods: periodsToCreate,
    });
    setResult(outcome);

    if (outcome.created > 0) {
      toast.success("Invoice berhasil dibuat.");
    } else if (outcome.conflicts.length > 0) {
      toast.error(
        `Periode sudah ditagih: ${outcome.conflicts.join(", ")}.`
      );
    } else {
      toast.error("Tidak ada periode yang perlu ditagih.");
    }
  }

  return {
    customers,
    customerId,
    selectCustomer,
    customer,
    customerSubscriptions,
    subscription,
    plan,
    packages,
    branchName,
    subscriptionServices,
    mode,
    setMode,
    startPeriod,
    setStartPeriod,
    count,
    setCount,
    intendedPeriods,
    periodsToCreate,
    skippedPeriods,
    unitPrice,
    taxAmount,
    estimatedTotal,
    result,
    commit,
  };
}
