import type { Customer } from "@/features/customers/data/types";
import type { PlanProfile } from "@/features/plan-profiles/data/types";
import type {
  Subscription,
  SubscriptionService,
} from "@/features/subscriptions/data/types";

import { resolvePeriods, type BillingRunPeriodMode } from "./period";
import type { Invoice } from "./types";

export type BillingRunPreviewRow = {
  subscriptionId: string;
  customerId: string;
  customerName: string;
  customerNumber: string;
  planName: string;
  subscriptionStatus: Subscription["status"];
  periodsToCreate: string[];
  skippedPeriods: string[];
  total: number;
  services: SubscriptionService[];
};

export function buildBillingPreviewRows({
  subscriptions,
  services,
  customers,
  packages,
  invoices,
  mode,
  startPeriod,
  count,
  branchId,
}: {
  subscriptions: Subscription[];
  services: SubscriptionService[];
  customers: Customer[];
  packages: PlanProfile[];
  invoices: Invoice[];
  mode: BillingRunPeriodMode;
  startPeriod: string;
  count: number;
  branchId?: string;
}): BillingRunPreviewRow[] {
  return subscriptions
    .filter(
      (subscription) =>
        (subscription.status === "active" ||
          subscription.status === "suspended") &&
        (!branchId || subscription.branchId === branchId)
    )
    .map((subscription) => {
      const customer = customers.find(
        (item) => item.id === subscription.customerId
      );
      const plan = packages.find((item) => item.id === subscription.planId);
      const billedPeriods = new Set(
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
      const intendedPeriods = resolvePeriods({
        mode,
        startPeriod,
        count,
        subscriptionStart: subscription.startDate,
      });
      const periodsToCreate = intendedPeriods.filter(
        (period) => !billedPeriods.has(period)
      );
      const skippedPeriods = intendedPeriods.filter((period) =>
        billedPeriods.has(period)
      );
      const taxPerPeriod = subscription.taxEnabled
        ? (subscription.priceSnapshot * 11) / 100
        : 0;
      const total =
        (subscription.priceSnapshot + taxPerPeriod) * periodsToCreate.length;

      return {
        subscriptionId: subscription.id,
        customerId: subscription.customerId,
        customerName: customer?.fullName ?? "-",
        customerNumber: customer?.customerNumber ?? "-",
        planName: plan?.name ?? "-",
        subscriptionStatus: subscription.status,
        periodsToCreate,
        skippedPeriods,
        total,
        services: services.filter(
          (service) => service.subscriptionId === subscription.id
        ),
      };
    })
    .sort((a, b) => a.customerName.localeCompare(b.customerName));
}
