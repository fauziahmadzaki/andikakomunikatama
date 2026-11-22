"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useNetworkStore } from "@/features/network/store/network-store";
import type {
  CredentialType,
  ServiceType,
} from "@/features/subscriptions/data/types";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription-store";

export function useServiceProvision({
  subscriptionId,
  branchId,
  onClose,
}: {
  subscriptionId: string;
  branchId: string;
  onClose: () => void;
}) {
  const addService = useSubscriptionStore((state) => state.addService);
  const addCredential = useSubscriptionStore((state) => state.addCredential);
  const routers = useNetworkStore((state) => state.routers).filter(
    (router) => router.branchId === branchId
  );
  const olts = useNetworkStore((state) => state.olts).filter(
    (olt) => olt.branchId === branchId
  );
  const passiveDevices = useNetworkStore((state) => state.passiveDevices).filter(
    (device) => device.branchId === branchId && device.type === "odp"
  );
  const [form, setForm] = useState({
    serviceType: "pppoe" as ServiceType,
    username: "",
    routerId: routers[0]?.id ?? "",
    oltId: olts[0]?.id ?? "",
    passiveDeviceId: passiveDevices[0]?.id ?? "",
    credentialType: "pppoe" as CredentialType,
    secretRef: "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function save() {
    if (!form.username.trim()) {
      toast.error("Username service wajib diisi.");
      return;
    }
    if (!form.routerId) {
      toast.error("Router wajib dipilih.");
      return;
    }
    const service = addService({
      subscriptionId,
      serviceType: form.serviceType,
      username: form.username,
      routerId: form.routerId,
      oltId: form.oltId || undefined,
      passiveDeviceId: form.passiveDeviceId || undefined,
      status: "pending",
    });
    addCredential({
      serviceId: service.id,
      credentialType: form.credentialType,
      username: form.username,
      secretRef: form.secretRef || `secret/service/${service.id}`,
      isActive: true,
    });
    toast.success("Service dan credential ditambahkan.");
    onClose();
  }

  return {
    routers,
    olts,
    passiveDevices,
    form,
    set,
    save,
  };
}
