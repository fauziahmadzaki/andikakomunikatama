"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { SubscriptionView } from "@/features/subscriptions/data/types";

export function SubscriptionActionDialog({
  action,
  subscription,
  reason,
  onReasonChange,
  onConfirm,
  onCancel,
}: {
  action: "suspend" | "reactivate" | "terminate" | null;
  subscription: SubscriptionView | null;
  reason: string;
  onReasonChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const title =
    action === "suspend"
      ? "Isolir langganan?"
      : action === "reactivate"
        ? "Aktifkan kembali langganan?"
        : "Terminasi langganan?";

  return (
    <Dialog
      isOpen={Boolean(action && subscription)}
      onOpenChange={(isOpen) => !isOpen && onCancel()}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          {subscription?.customerName} · {subscription?.number}
        </DialogDescription>
      </DialogHeader>

      {action !== "reactivate" ? (
        <Textarea
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          placeholder="Alasan tindakan (opsional)"
          rows={3}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Service yang sebelumnya suspended akan diaktifkan kembali.
        </p>
      )}

      <DialogFooter>
        <Button variant="outline" onPress={onCancel}>
          Batal
        </Button>
        <Button
          variant={action === "reactivate" ? "default" : "destructive"}
          onPress={onConfirm}
        >
          {action === "suspend"
            ? "Isolir"
            : action === "reactivate"
              ? "Aktifkan"
              : "Terminasi"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
