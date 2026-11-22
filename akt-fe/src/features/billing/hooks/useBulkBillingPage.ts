"use client";

import { useMemo, useState } from "react";

import { useBillingStore } from "@/features/billing/store/billing-store";
import { useBranchStore } from "@/features/branches/store/branch-store";
import { useCustomerStore } from "@/features/customers/store/customer-store";
import { usePlanProfileStore } from "@/features/plan-profiles/store/plan-profile-store";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription-store";
import {
  currentPeriod,
  type BillingRunPeriodMode,
} from "@/features/billing/data/period";
import { buildBillingPreviewRows } from "@/features/billing/data/run";

export function useBulkBillingPage() {
  const branches = useBranchStore((state) => state.branches).filter(
    (branch) => branch.isActive
  );
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const services = useSubscriptionStore((state) => state.services);
  const customers = useCustomerStore((state) => state.customers);
  const packages = usePlanProfileStore((state) => state.profiles);
  const invoices = useBillingStore((state) => state.invoices);
  const [mode, setMode] = useState<BillingRunPeriodMode>("unbilled");
  const [startPeriod, setStartPeriod] = useState(() => currentPeriod());
  const [count, setCount] = useState("3");
  const [selectedBranchIds, setSelectedBranchIds] = useState<Set<string>>(
    new Set()
  );
  const [dialogBranchId, setDialogBranchId] = useState<string | null>(null);

  function toggleBranch(branchId: string) {
    setSelectedBranchIds((current) => {
      const next = new Set(current);
      if (next.has(branchId)) {
        next.delete(branchId);
      } else {
        next.add(branchId);
      }
      return next;
    });
  }

  function selectAllBranches() {
    setSelectedBranchIds(new Set(branches.map((branch) => branch.id)));
  }

  function clearBranches() {
    setSelectedBranchIds(new Set());
  }

  const branchSummaries = useMemo(
    () =>
      branches
        .filter((branch) => selectedBranchIds.has(branch.id))
        .map((branch) => {
          const rows = buildBillingPreviewRows({
            subscriptions,
            services,
            customers,
            packages,
            invoices,
            mode,
            startPeriod,
            count: Number(count),
            branchId: branch.id,
          });
          const billableRows = rows.filter(
            (row) => row.periodsToCreate.length > 0
          );

          return {
            branch,
            rows,
            billableCount: billableRows.length,
            total: billableRows.reduce((total, row) => total + row.total, 0),
          };
        }),
    [
      branches,
      count,
      customers,
      invoices,
      mode,
      packages,
      selectedBranchIds,
      services,
      startPeriod,
      subscriptions,
    ]
  );

  const dialogSummary = branchSummaries.find(
    (summary) => summary.branch.id === dialogBranchId
  );

  return {
    branches,
    mode,
    setMode,
    startPeriod,
    setStartPeriod,
    count,
    setCount,
    selectedBranchIds,
    toggleBranch,
    selectAllBranches,
    clearBranches,
    branchSummaries,
    dialogSummary,
    openPreview: setDialogBranchId,
    closePreview: () => setDialogBranchId(null),
  };
}
