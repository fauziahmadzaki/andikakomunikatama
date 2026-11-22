"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useBranchStore } from "@/features/branches/store/branch-store";
import { useNetworkStore } from "@/features/network/store/network-store";

export function useNetworkOverview() {
  const routers = useNetworkStore((state) => state.routers);
  const olts = useNetworkStore((state) => state.olts);
  const acsServers = useNetworkStore((state) => state.acsServers);
  const passiveDevices = useNetworkStore((state) => state.passiveDevices);
  const inventory = useNetworkStore((state) => state.inventory);
  const testRouter = useNetworkStore((state) => state.testRouter);
  const testOlt = useNetworkStore((state) => state.testOlt);
  const syncAcs = useNetworkStore((state) => state.syncAcs);
  const branches = useBranchStore((state) => state.branches);
  const [oltOpen, setOltOpen] = useState(false);
  const [credentialDevice, setCredentialDevice] = useState<{
    id: string;
    name: string;
    type: "router" | "olt";
  } | null>(null);

  function test(deviceId: string, type: "router" | "olt") {
    if (type === "router") {
      testRouter(deviceId);
      toast.success("Test koneksi router dijalankan.");
    } else {
      testOlt(deviceId);
      toast.success("Test koneksi OLT dijalankan.");
    }
  }

  function sync(acsId: string) {
    syncAcs(acsId);
    toast.success("Sinkronisasi ACS dijalankan.");
  }

  return {
    routers,
    olts,
    acsServers,
    passiveDevices,
    inventory,
    branches,
    oltOpen,
    setOltOpen,
    credentialDevice,
    setCredentialDevice,
    test,
    sync,
  };
}
