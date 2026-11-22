"use client";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  paymentMethodLabel,
  paymentStatusLabel,
  paymentStatusTone,
} from "@/features/payments/data/status";
import type { Payment } from "@/features/payments/data/types";
import { formatDateTime, formatRupiah } from "@/lib/format";

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-words">{value || "-"}</p>
    </div>
  );
}

export function PaymentDetailDialog({
  payment,
  onClose,
}: {
  payment: Payment | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      isOpen={Boolean(payment)}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      className="sm:max-w-2xl"
    >
      <DialogHeader>
        <DialogTitle>{payment?.number ?? "Detail pembayaran"}</DialogTitle>
        <DialogDescription>
          {payment?.invoiceNumber ?? "-"} · {payment?.customerName ?? "-"}
        </DialogDescription>
      </DialogHeader>

      {payment ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <StatusBadge tone={paymentStatusTone[payment.status]}>
              {paymentStatusLabel[payment.status]}
            </StatusBadge>
            <span className="text-sm text-muted-foreground">
              {paymentMethodLabel[payment.method]}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Pelanggan" value={payment.customerName} />
            <DetailItem label="Layanan" value={payment.serviceName} />
            <DetailItem label="Cabang" value={payment.branchName} />
            <DetailItem
              label="Waktu"
              value={formatDateTime(payment.paidAt)}
            />
            <DetailItem
              label="Nominal pembayaran"
              value={formatRupiah(payment.amount)}
            />
            <DetailItem
              label="Nominal terbayarkan"
              value={formatRupiah(payment.paidAmount)}
            />
            <DetailItem label="Referensi" value={payment.reference} />
            <DetailItem label="Bukti" value={payment.proofFileName} />
            <DetailItem
              label="Invoice"
              value={payment.invoiceNumber}
            />
            <DetailItem label="Catatan" value={payment.notes} />
          </div>
        </div>
      ) : null}

      <DialogFooter>
        <Button type="button" variant="outline" onPress={onClose}>
          Tutup
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
