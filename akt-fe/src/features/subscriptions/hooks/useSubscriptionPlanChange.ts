"use client";

import { useState } from "react";
import { toast } from "sonner";

import { usePlanProfileStore } from "@/features/plan-profiles/store/plan-profile-store";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription-store";

export function useSubscriptionPlanChange({
  subscriptionId,
  currentPlanId,
  onClose,
}: {
  subscriptionId: string;
  currentPlanId: string;
  onClose: () => void;
}) {
  const plans = usePlanProfileStore((state) => state.profiles);
  const changePlan = useSubscriptionStore((state) => state.changePlan);
  const [targetPlanId, setTargetPlanId] = useState(currentPlanId);

  const targetPlan = plans.find((plan) => plan.id === targetPlanId);
  const targetPrice = targetPlan?.price ?? 0;

  function save() {
    if (targetPlanId === currentPlanId) {
      toast.error("Pilih paket yang berbeda.");
      return;
    }
    changePlan(subscriptionId, targetPlanId);
    toast.success("Paket langganan diubah.");
    onClose();
  }

  return { plans, targetPlanId, setTargetPlanId, targetPlan, targetPrice, save };
}
