"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useBillingStore } from "@/features/billing/store/billing-store";
import { useBranchStore } from "@/features/branches/store/branch-store";
import { useCustomerStore } from "@/features/customers/store/customer-store";
import { useNetworkStore } from "@/features/network/store/network-store";
import { usePlanProfileStore } from "@/features/plan-profiles/store/plan-profile-store";
import { buildServiceView, buildSubscriptionView } from "@/features/subscriptions/data/view";
import type { ServiceCredential } from "@/features/subscriptions/data/types";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription-store";
import { useUsersStore } from "@/features/users/store/users-store";

export function useSubscriptionDetail(id: string) {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const services = useSubscriptionStore((state) => state.services);
  const credentials = useSubscriptionStore((state) => state.credentials);
  const history = useSubscriptionStore((state) => state.history);
  const activate = useSubscriptionStore((state) => state.activate);
  const suspend = useSubscriptionStore((state) => state.suspend);
  const reactivate = useSubscriptionStore((state) => state.reactivate);
  const terminate = useSubscriptionStore((state) => state.terminate);
  const provisionService = useSubscriptionStore(
    (state) => state.provisionService
  );
  const terminateService = useSubscriptionStore(
    (state) => state.terminateService
  );
  const rotateCredential = useSubscriptionStore(
    (state) => state.rotateCredential
  );
  const customers = useCustomerStore((state) => state.customers);
  const invoices = useBillingStore((state) => state.invoices);
  const packages = usePlanProfileStore((state) => state.profiles);
  const branches = useBranchStore((state) => state.branches);
  const employees = useUsersStore((state) => state.employees);
  const routers = useNetworkStore((state) => state.routers);
  const olts = useNetworkStore((state) => state.olts);
  const passiveDevices = useNetworkStore((state) => state.passiveDevices);

  const subscription = subscriptions.find((item) => item.id === id);
  const [provisionOpen, setProvisionOpen] = useState(false);
  const [planChangeOpen, setPlanChangeOpen] = useState(false);
  const [action, setAction] = useState<"suspend" | "reactivate" | "terminate" | null>(
    null
  );
  const [reason, setReason] = useState("");
  const [rotateTarget, setRotateTarget] = useState<ServiceCredential | null>(
    null
  );
  const [newSecret, setNewSecret] = useState("");

  const subscriptionServices = services.filter(
    (service) => service.subscriptionId === id
  );
  const serviceIds = new Set(subscriptionServices.map((service) => service.id));
  const subscriptionCredentials = credentials.filter((credential) =>
    serviceIds.has(credential.serviceId)
  );
  const subscriptionHistory = [...history]
    .filter((item) => item.subscriptionId === id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const view = subscription
    ? buildSubscriptionView({
        subscription,
        customers,
        branches,
        plans: packages,
        employees,
        outstanding: invoices
          .filter(
            (invoice) =>
              invoice.customerId === subscription.customerId &&
              invoice.status !== "void"
          )
          .reduce(
            (total, invoice) => total + (invoice.total - invoice.paidAmount),
            0
          ),
      })
    : undefined;

  const serviceViews = subscriptionServices.map((service) =>
    buildServiceView({ service, routers, olts, passiveDevices })
  );

  function confirmAction() {
    if (!subscription || !action) {
      return;
    }
    if (action === "suspend") {
      suspend(subscription.id, reason || "Isolir manual.");
      toast.success("Langganan diisolir.");
    } else if (action === "reactivate") {
      reactivate(subscription.id);
      toast.success("Langganan diaktifkan kembali.");
    } else {
      terminate(subscription.id, reason || "Terminasi langganan.");
      toast.success("Langganan diterminasi.");
    }
    setAction(null);
    setReason("");
  }

  function activateSubscription() {
    if (!subscription) {
      return;
    }
    activate(subscription.id);
    toast.success("Langganan diaktifkan.");
  }

  function provision(serviceId: string) {
    provisionService(serviceId);
    toast.success("Service diprovision.");
  }

  function terminateServiceAction(serviceId: string) {
    terminateService(serviceId);
    toast.success("Service diterminasi.");
  }

  function rotateCredentialAction() {
    if (!rotateTarget || newSecret.trim().length < 6) {
      toast.error("Secret minimal 6 karakter.");
      return;
    }
    rotateCredential(rotateTarget.id, newSecret);
    toast.success("Credential dirotasi.");
    setRotateTarget(null);
    setNewSecret("");
  }

  return {
    subscription: view,
    services: serviceViews,
    credentials: subscriptionCredentials,
    history: subscriptionHistory,
    provisionOpen,
    setProvisionOpen,
    planChangeOpen,
    setPlanChangeOpen,
    action,
    setAction,
    reason,
    setReason,
    confirmAction,
    activateSubscription,
    provisionService: provision,
    terminateService: terminateServiceAction,
    rotateTarget,
    setRotateTarget,
    newSecret,
    setNewSecret,
    rotateCredentialAction,
  };
}
