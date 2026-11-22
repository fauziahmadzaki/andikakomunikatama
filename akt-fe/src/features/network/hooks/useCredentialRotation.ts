"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useNetworkStore } from "@/features/network/store/network-store";

export function useCredentialRotation({
  device,
  onClose,
}: {
  device: { id: string; name: string; type: "router" | "olt" } | null;
  onClose: () => void;
}) {
  const [secret, setSecret] = useState("");
  const rotateRouterSecret = useNetworkStore(
    (state) => state.rotateRouterSecret
  );
  const updateOlt = useNetworkStore((state) => state.updateOlt);

  function save() {
    if (!device) {
      return;
    }
    if (secret.trim().length < 6) {
      toast.error("Secret minimal 6 karakter.");
      return;
    }
    if (device.type === "router") {
      rotateRouterSecret(device.id, secret);
    } else {
      updateOlt(device.id, { secretConfigured: true });
    }
    toast.success("Credential berhasil dirotasi (mock).");
    setSecret("");
    onClose();
  }

  return { secret, setSecret, save };
}
