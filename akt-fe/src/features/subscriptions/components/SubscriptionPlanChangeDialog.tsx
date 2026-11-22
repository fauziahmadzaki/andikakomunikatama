"use client";

import { SelectField } from "@/components/shared/SelectField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSubscriptionPlanChange } from "@/features/subscriptions/hooks/useSubscriptionPlanChange";
import { formatRupiah } from "@/lib/format";

export function SubscriptionPlanChangeDialog({
  open,
  subscriptionId,
  currentPlanId,
  onClose,
}: {
  open: boolean;
  subscriptionId: string;
  currentPlanId: string;
  onClose: () => void;
}) {
  const { plans, targetPlanId, setTargetPlanId, targetPlan, targetPrice, save } =
    useSubscriptionPlanChange({
      subscriptionId,
      currentPlanId,
      onClose,
    });

  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>Ubah paket</DialogTitle>
        <DialogDescription>
          Harga baru berlaku untuk invoice berikutnya.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Paket baru</p>
          <SelectField
            value={targetPlanId}
            onValueChange={setTargetPlanId}
            ariaLabel="Paket baru"
            options={plans.map((plan) => ({
              value: plan.id,
              label: plan.name,
            }))}
          />
        </div>
        <div className="rounded-lg bg-muted/50 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paket target</span>
            <span className="font-medium">{targetPlan?.name ?? "-"}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-muted-foreground">Harga baru</span>
            <span className="font-semibold">{formatRupiah(targetPrice)}</span>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onPress={onClose}>
          Batal
        </Button>
        <Button onPress={save}>Ubah paket</Button>
      </DialogFooter>
    </Dialog>
  );
}
