"use client";

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BillingRunPeriodMode } from "@/features/billing/data/period";
import type { BillingRunPreviewRow } from "@/features/billing/data/run";
import { useBranchBillingPreview } from "@/features/billing/hooks/useBranchBillingPreview";
import {
  subscriptionStatusLabel,
  subscriptionTone,
} from "@/features/subscriptions/data/status";
import { formatRupiah } from "@/lib/format";

function periodSummary(
  mode: BillingRunPeriodMode,
  startPeriod: string,
  count: number
) {
  if (mode === "unbilled") {
    return "Periode belum ditagih";
  }
  if (mode === "single") {
    return `Periode ${startPeriod}`;
  }
  if (mode === "6months") {
    return `6 periode mulai ${startPeriod}`;
  }
  if (mode === "1year") {
    return `12 periode mulai ${startPeriod}`;
  }
  return `${count} periode mulai ${startPeriod}`;
}

export function BranchBillingPreviewDialog({
  open,
  branchName,
  rows,
  mode,
  startPeriod,
  count,
  onClose,
}: {
  open: boolean;
  branchName: string;
  rows: BillingRunPreviewRow[];
  mode: BillingRunPeriodMode;
  startPeriod: string;
  count: number;
  onClose: () => void;
}) {
  const {
    billableRows,
    selectedKeys,
    setSelectedKeys,
    allKeys,
    selectedRows,
    total,
    confirm,
  } = useBranchBillingPreview({ rows, onClose });

  const columns: DataTableColumn<BillingRunPreviewRow>[] = [
    {
      key: "customerName",
      header: "Pelanggan",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.customerName}</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {row.customerNumber}
          </p>
        </div>
      ),
    },
    { key: "planName", header: "Paket" },
    {
      key: "subscriptionStatus",
      header: "Status",
      cell: (row) => (
        <StatusBadge tone={subscriptionTone[row.subscriptionStatus]}>
          {subscriptionStatusLabel[row.subscriptionStatus]}
        </StatusBadge>
      ),
    },
    {
      key: "periods",
      header: "Periode",
      cell: (row) => {
        const first = row.periodsToCreate[0];
        const last = row.periodsToCreate[row.periodsToCreate.length - 1];
        return (
          <div>
            <p className="font-mono text-xs">
              {first === last ? first : `${first} – ${last}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.periodsToCreate.length} periode
              {row.skippedPeriods.length > 0
                ? ` · ${row.skippedPeriods.length} dilewati`
                : ""}
            </p>
          </div>
        );
      },
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      cell: (row) => (
        <span className="font-medium">{formatRupiah(row.total)}</span>
      ),
    },
  ];

  return (
    <Dialog
      isOpen={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      className="sm:max-w-4xl lg:min-w-[52rem]"
    >
      <DialogHeader>
        <DialogTitle>Preview tagihan — {branchName}</DialogTitle>
        <DialogDescription>
          {periodSummary(mode, startPeriod, count)}. Pilih pelanggan yang akan
          ditagih.
        </DialogDescription>
      </DialogHeader>

      <div className="max-h-[65vh] min-w-0 space-y-3 overflow-y-auto">
        <DataTable
          data={billableRows}
          columns={columns}
          getRowKey={(row) => row.subscriptionId}
          ariaLabel={`Preview tagihan cabang ${branchName}`}
          emptyMessage="Semua pelanggan di cabang ini sudah ditagih."
          selection={{
            selectedKeys,
            allKeys,
            onSelectionChange: setSelectedKeys,
          }}
        />

        <div className="flex items-center justify-between border-t pt-3 text-sm">
          <span className="text-muted-foreground">
            {selectedRows.length} pelanggan dipilih
          </span>
          <span className="font-semibold">{formatRupiah(total)}</span>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onPress={onClose}>
          Batal
        </Button>
        <Button
          type="button"
          onPress={confirm}
          isDisabled={selectedRows.length === 0}
        >
          Tagih {selectedRows.length} pelanggan
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
