import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useAuditStore } from "@/features/audit/store/audit-store";
import { usePlanProfileStore } from "@/features/plan-profiles/store/plan-profile-store";
import {
  seedCredentials,
  seedHistory,
  seedServices,
  seedSubscriptions,
  seedSuspensionCandidates,
} from "../data/seed";
import type {
  ServiceCredential,
  Subscription,
  SubscriptionHistory,
  SubscriptionService,
  SuspensionCandidate,
} from "../data/types";

type NewSubscription = Omit<Subscription, "id" | "number" | "createdAt">;

type SubscriptionState = {
  subscriptions: Subscription[];
  services: SubscriptionService[];
  credentials: ServiceCredential[];
  history: SubscriptionHistory[];
  suspensionCandidates: SuspensionCandidate[];
  addSubscription: (input: NewSubscription, actor?: string) => Subscription;
  updateSubscription: (
    id: string,
    patch: Partial<Subscription>,
    actor?: string
  ) => void;
  addService: (
    input: Omit<SubscriptionService, "id">,
    actor?: string
  ) => SubscriptionService;
  addCredential: (
    input: Omit<ServiceCredential, "id">,
    actor?: string
  ) => void;
  rotateCredential: (id: string, secretRef: string, actor?: string) => void;
  terminateService: (id: string, actor?: string) => void;
  provisionService: (serviceId: string, actor?: string) => void;
  activate: (id: string, actor?: string) => void;
  suspend: (id: string, reason: string, actor?: string) => void;
  reactivate: (id: string, actor?: string) => void;
  terminate: (id: string, reason: string, actor?: string) => void;
  changePlan: (id: string, planId: string, actor?: string) => void;
  bulkChangePlan: (
    sourcePlanId: string,
    targetPlanId: string,
    branchId?: string
  ) => number;
  toggleSuspensionCandidate: (id: string) => void;
  runSuspensionBatch: (ids: string[]) => number;
  resetSubscriptions: () => void;
};

function id() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

function audit(
  action: string,
  entityId: string,
  description: string,
  actor = "Administrator"
) {
  useAuditStore.getState().addAudit({
    action,
    entityType: "subscription",
    entityId,
    actor,
    branch: "JKT-01",
    description,
  });
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscriptions: seedSubscriptions,
      services: seedServices,
      credentials: seedCredentials,
      history: seedHistory,
      suspensionCandidates: seedSuspensionCandidates,

      addSubscription: (input, actor = "Customer Service") => {
        const number = `SUB-2026-${String(get().subscriptions.length + 1).padStart(
          6,
          "0"
        )}`;
        const subscription: Subscription = {
          ...input,
          id: id(),
          number,
          createdAt: now().slice(0, 10),
        };
        set((state) => ({
          subscriptions: [subscription, ...state.subscriptions],
          history: [
            {
              id: id(),
              subscriptionId: subscription.id,
              status: subscription.status,
              reason: "Langganan dibuat.",
              actor,
              createdAt: now(),
            },
            ...state.history,
          ],
        }));
        audit(
          "subscription.created",
          subscription.number,
          `Langganan ${subscription.number} dibuat.`,
          actor
        );
        return subscription;
      },

      updateSubscription: (subscriptionId, patch, actor = "Administrator") => {
        set((state) => ({
          subscriptions: state.subscriptions.map((subscription) =>
            subscription.id === subscriptionId
              ? { ...subscription, ...patch }
              : subscription
          ),
        }));
        const subscription = get().subscriptions.find(
          (item) => item.id === subscriptionId
        );
        audit(
          "subscription.updated",
          subscription?.number ?? subscriptionId,
          `Langganan ${subscription?.number ?? subscriptionId} diperbarui.`,
          actor
        );
      },

      addService: (input, actor = "NOC") => {
        const service: SubscriptionService = { ...input, id: id() };
        set((state) => ({ services: [service, ...state.services] }));
        audit(
          "service.created",
          service.username,
          `Service ${service.serviceType} ditambahkan.`,
          actor
        );
        return service;
      },

      addCredential: (input, actor = "NOC") => {
        const credential: ServiceCredential = { ...input, id: id() };
        set((state) => ({
          credentials: [credential, ...state.credentials],
        }));
        audit(
          "service.credential_created",
          credential.username,
          `Credential ${credential.credentialType} ditambahkan.`,
          actor
        );
      },

      rotateCredential: (credentialId, secretRef, actor = "NOC") => {
        set((state) => ({
          credentials: state.credentials.map((credential) =>
            credential.id === credentialId
              ? { ...credential, secretRef }
              : credential
          ),
        }));
        audit(
          "service.credential_rotated",
          credentialId,
          "Credential service dirotasi.",
          actor
        );
      },

      terminateService: (serviceId, actor = "NOC") => {
        set((state) => ({
          services: state.services.map((service) =>
            service.id === serviceId
              ? {
                  ...service,
                  status: "terminated",
                  terminatedAt: now().slice(0, 10),
                }
              : service
          ),
          credentials: state.credentials.map((credential) =>
            credential.serviceId === serviceId
              ? { ...credential, isActive: false }
              : credential
          ),
        }));
        audit(
          "service.terminated",
          serviceId,
          "Service diterminasi.",
          actor
        );
      },

      provisionService: (serviceId, actor = "NOC") => {
        set((state) => ({
          services: state.services.map((service) =>
            service.id === serviceId
              ? { ...service, status: "provisioned" }
              : service
          ),
        }));
        const service = get().services.find((item) => item.id === serviceId);
        audit(
          "service.provisioned",
          service?.username ?? serviceId,
          `Service ${service?.username ?? serviceId} diprovision.`,
          actor
        );
      },

      activate: (subscriptionId, actor = "Customer Service") => {
        set((state) => ({
          subscriptions: state.subscriptions.map((subscription) =>
            subscription.id === subscriptionId
              ? { ...subscription, status: "active" }
              : subscription
          ),
          services: state.services.map((service) =>
            service.subscriptionId === subscriptionId
              ? { ...service, status: "active" }
              : service
          ),
          history: [
            {
              id: id(),
              subscriptionId,
              status: "active",
              reason: "Langganan diaktifkan.",
              actor,
              createdAt: now(),
            },
            ...state.history,
          ],
        }));
        const subscription = get().subscriptions.find(
          (item) => item.id === subscriptionId
        );
        audit(
          "subscription.activated",
          subscription?.number ?? subscriptionId,
          `Langganan ${subscription?.number ?? subscriptionId} diaktifkan.`,
          actor
        );
      },

      suspend: (subscriptionId, reason, actor = "Administrator") => {
        set((state) => ({
          subscriptions: state.subscriptions.map((subscription) =>
            subscription.id === subscriptionId
              ? { ...subscription, status: "suspended" }
              : subscription
          ),
          services: state.services.map((service) =>
            service.subscriptionId === subscriptionId
              ? { ...service, status: "suspended" }
              : service
          ),
          history: [
            {
              id: id(),
              subscriptionId,
              status: "suspended",
              reason,
              actor,
              createdAt: now(),
            },
            ...state.history,
          ],
        }));
        const subscription = get().subscriptions.find(
          (item) => item.id === subscriptionId
        );
        audit(
          "subscription.suspended",
          subscription?.number ?? subscriptionId,
          reason,
          actor
        );
      },

      reactivate: (subscriptionId, actor = "Administrator") => {
        set((state) => ({
          subscriptions: state.subscriptions.map((subscription) =>
            subscription.id === subscriptionId
              ? { ...subscription, status: "active" }
              : subscription
          ),
          services: state.services.map((service) =>
            service.subscriptionId === subscriptionId
              ? { ...service, status: "active" }
              : service
          ),
          history: [
            {
              id: id(),
              subscriptionId,
              status: "active",
              reason: "Langganan diaktifkan kembali.",
              actor,
              createdAt: now(),
            },
            ...state.history,
          ],
        }));
        const subscription = get().subscriptions.find(
          (item) => item.id === subscriptionId
        );
        audit(
          "subscription.reactivated",
          subscription?.number ?? subscriptionId,
          `Langganan ${subscription?.number ?? subscriptionId} diaktifkan kembali.`,
          actor
        );
      },

      terminate: (subscriptionId, reason, actor = "Administrator") => {
        set((state) => ({
          subscriptions: state.subscriptions.map((subscription) =>
            subscription.id === subscriptionId
              ? {
                  ...subscription,
                  status: "terminated",
                  endDate: now().slice(0, 10),
                }
              : subscription
          ),
          services: state.services.map((service) =>
            service.subscriptionId === subscriptionId
              ? {
                  ...service,
                  status: "terminated",
                  terminatedAt: now().slice(0, 10),
                }
              : service
          ),
          credentials: state.credentials.map((credential) => {
            const service = get().services.find(
              (item) => item.id === credential.serviceId
            );
            return service?.subscriptionId === subscriptionId
              ? { ...credential, isActive: false }
              : credential;
          }),
          history: [
            {
              id: id(),
              subscriptionId,
              status: "terminated",
              reason,
              actor,
              createdAt: now(),
            },
            ...state.history,
          ],
        }));
        const subscription = get().subscriptions.find(
          (item) => item.id === subscriptionId
        );
        audit(
          "subscription.terminated",
          subscription?.number ?? subscriptionId,
          reason,
          actor
        );
      },

      changePlan: (subscriptionId, planId, actor = "Administrator") => {
        const packages = usePlanProfileStore.getState().profiles;
        const plan = packages.find((item) => item.id === planId);
        if (!plan) {
          return;
        }
        const price = plan.price;
        set((state) => ({
          subscriptions: state.subscriptions.map((subscription) =>
            subscription.id === subscriptionId
              ? {
                  ...subscription,
                  planId,
                  priceSnapshot: price,
                }
              : subscription
          ),
          history: [
            {
              id: id(),
              subscriptionId,
              status:
                get().subscriptions.find((item) => item.id === subscriptionId)
                  ?.status ?? "active",
              reason: `Paket diubah ke ${plan.name}.`,
              actor,
              createdAt: now(),
            },
            ...state.history,
          ],
        }));
        audit(
          "subscription.plan_changed",
          subscriptionId,
          `Paket diubah ke ${plan.name}.`,
          actor
        );
      },

      bulkChangePlan: (sourcePlanId, targetPlanId, branchId) => {
        const packages = usePlanProfileStore.getState().profiles;
        const targetPlan = packages.find((item) => item.id === targetPlanId);
        if (!targetPlan) {
          return 0;
        }
        const targetPrice = targetPlan.price;
        let count = 0;
        set((state) => ({
          subscriptions: state.subscriptions.map((subscription) => {
            if (
              subscription.planId === sourcePlanId &&
              subscription.status !== "terminated" &&
              (!branchId || subscription.branchId === branchId)
            ) {
              count += 1;
              return {
                ...subscription,
                planId: targetPlanId,
                priceSnapshot: targetPrice,
              };
            }
            return subscription;
          }),
        }));
        audit(
          "subscription.bulk_migrated",
          sourcePlanId,
          `${count} langganan dimigrasikan ke ${targetPlan.name}.`
        );
        return count;
      },

      toggleSuspensionCandidate: (candidateId) => {
        set((state) => ({
          suspensionCandidates: state.suspensionCandidates.map((candidate) =>
            candidate.id === candidateId
              ? { ...candidate, selected: !candidate.selected }
              : candidate
          ),
        }));
      },

      runSuspensionBatch: (ids) => {
        let count = 0;
        set((state) => ({
          subscriptions: state.subscriptions.map((subscription) => {
            if (ids.includes(subscription.id)) {
              count += 1;
              return { ...subscription, status: "suspended" };
            }
            return subscription;
          }),
          services: state.services.map((service) =>
            ids.includes(service.subscriptionId)
              ? { ...service, status: "suspended" }
              : service
          ),
          suspensionCandidates: state.suspensionCandidates.map((candidate) =>
            ids.includes(candidate.subscriptionId)
              ? { ...candidate, result: "success" }
              : candidate
          ),
        }));
        audit(
          "subscription.auto_suspended",
          `batch-${Date.now()}`,
          `${count} langganan diisolir otomatis.`,
          "System"
        );
        return count;
      },

      resetSubscriptions: () => {
        set({
          subscriptions: seedSubscriptions,
          services: seedServices,
          credentials: seedCredentials,
          history: seedHistory,
          suspensionCandidates: seedSuspensionCandidates,
        });
      },
    }),
    {
      name: "muranet-subscriptions-v2",
      skipHydration: true,
      version: 2,
      migrate: (persistedState) => {
        const state = (persistedState ?? {}) as Partial<SubscriptionState>;
        const planMap: Record<string, string> = {
          "plan-home-20": "profile-home-20",
          "plan-home-30": "profile-home-30",
          "plan-home-50": "profile-home-50",
          "plan-biz-100": "profile-biz-100",
          "plan-biz-200": "profile-biz-200",
          "plan-hotspot": "profile-hotspot-5",
        };
        const subscriptions = Array.isArray(state.subscriptions)
          ? state.subscriptions.map((subscription) => ({
              ...subscription,
              planId: planMap[subscription.planId] ?? subscription.planId,
            }))
          : seedSubscriptions;

        return { ...state, subscriptions } as SubscriptionState;
      },
    }
  )
);
