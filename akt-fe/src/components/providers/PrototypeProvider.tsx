"use client";

import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { useAuditStore } from "@/features/audit/store/audit-store";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useBillingStore } from "@/features/billing/store/billing-store";
import { useBranchStore } from "@/features/branches/store/branch-store";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { useCompanyStore } from "@/features/company/store/company-store";
import { useCustomerStore } from "@/features/customers/store/customer-store";
import { useFinanceStore } from "@/features/finance/store/finance-store";
import { useIntegrationStore } from "@/features/integrations/store/integration-store";
import { useMigrationStore } from "@/features/migration/store/migration-store";
import { useNetworkStore } from "@/features/network/store/network-store";
import { useNotificationStore } from "@/features/notifications/store/notification-store";
import { usePaymentStore } from "@/features/payments/store/payment-store";
import { usePlanProfileStore } from "@/features/plan-profiles/store/plan-profile-store";
import { useSequenceStore } from "@/features/sequences/store/sequence-store";
import { useSettingsStore } from "@/features/settings/store/settings-store";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription-store";
import { useTicketStore } from "@/features/tickets/store/ticket-store";
import { useUsersStore } from "@/features/users/store/users-store";

const stores = [
  useAuthStore,
  useUsersStore,
  useAuditStore,
  useCompanyStore,
  useBranchStore,
  useSettingsStore,
  useSequenceStore,
  useCustomerStore,
  useCatalogStore,
  useSubscriptionStore,
  useNetworkStore,
  useBillingStore,
  usePaymentStore,
  usePlanProfileStore,
  useTicketStore,
  useFinanceStore,
  useNotificationStore,
  useIntegrationStore,
  useMigrationStore,
];

const subscribe = (onStoreChange: () => void) => {
  const unsubscribers = stores.map((store) =>
    store.persist.onFinishHydration(onStoreChange)
  );

  stores.forEach((store) => {
    store.persist.rehydrate();
  });

  return () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  };
};

const getSnapshot = () =>
  stores.every((store) => store.persist.hasHydrated());

const getServerSnapshot = () => false;

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const ready = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  if (!ready) {
    return null;
  }

  return children;
}
