"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useBillingStore } from "@/features/billing/store/billing-store";
import type { BillingRunPreviewRow } from "@/features/billing/data/run";

export function useBranchBillingPreview({
  rows,
  onClose,
}: {
  rows: BillingRunPreviewRow[];
  onClose: () => void;
}) {
  const generateInvoice = useBillingStore(
    (state) => state.generateInvoiceForSubscription
  );
  const billableRows = useMemo(
    () => rows.filter((row) => row.periodsToCreate.length > 0),
    [rows]
  );
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () => new Set(billableRows.map((row) => row.subscriptionId))
  );

  const allKeys = billableRows.map((row) => row.subscriptionId);
  const selectedRows = billableRows.filter((row) =>
    selectedKeys.has(row.subscriptionId)
  );
  const total = selectedRows.reduce((sum, row) => sum + row.total, 0);

  function confirm() {
    if (selectedRows.length === 0) {
      toast.error("Pilih minimal satu pelanggan.");
      return;
    }

    let created = 0;
    let skipped = 0;
    const conflicts: string[] = [];

    selectedRows.forEach((row) => {
      const outcome = generateInvoice({
        subscriptionId: row.subscriptionId,
        periods: row.periodsToCreate,
      });
      created += outcome.created;
      skipped += outcome.skipped;
      conflicts.push(...outcome.conflicts);
    });

    if (created > 0) {
      toast.success(`${created} invoice dibuat.`);
    }
    if (skipped > 0 || conflicts.length > 0) {
      toast.info(
        `${skipped} periode dilewati karena sudah memiliki invoice.`
      );
    }
    onClose();
  }

  return {
    billableRows,
    selectedKeys,
    setSelectedKeys,
    allKeys,
    selectedRows,
    total,
    confirm,
  };
}
