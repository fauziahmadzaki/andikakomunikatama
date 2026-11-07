"use client";

import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { useCustomerStore } from "@/features/customers/store/customer-store";
import { useFoundationStore } from "@/features/foundation/store/foundation-store";

const stores = [useAuthStore, useFoundationStore, useCustomerStore];

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
