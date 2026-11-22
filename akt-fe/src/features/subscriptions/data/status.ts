import type { StatusTone } from "@/components/shared/StatusBadge";

import type { ServiceStatus, SubscriptionStatus } from "./types";

export const subscriptionTone: Record<SubscriptionStatus, StatusTone> = {
  draft: "primary",
  active: "success",
  suspended: "warning",
  terminated: "neutral",
};

export const subscriptionStatusLabel: Record<SubscriptionStatus, string> = {
  draft: "Draft",
  active: "Aktif",
  suspended: "Isolir",
  terminated: "Terminasi",
};

export const serviceStatusTone: Record<ServiceStatus, StatusTone> = {
  pending: "neutral",
  provisioned: "primary",
  active: "success",
  suspended: "warning",
  terminated: "neutral",
};

export const serviceStatusLabel: Record<ServiceStatus, string> = {
  pending: "Menunggu",
  provisioned: "Siap",
  active: "Aktif",
  suspended: "Isolir",
  terminated: "Terminasi",
};
