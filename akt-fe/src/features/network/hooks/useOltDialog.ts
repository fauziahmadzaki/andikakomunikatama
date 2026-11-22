"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useBranchStore } from "@/features/branches/store/branch-store";
import { useNetworkStore } from "@/features/network/store/network-store";

export function useOltDialog({ onClose }: { onClose: () => void }) {
  const branches = useBranchStore((state) => state.branches);
  const addOlt = useNetworkStore((state) => state.addOlt);
  const [form, setForm] = useState({
    name: "",
    branchId: branches[0]?.id ?? "br-jkt",
    vendor: "ZTE",
    model: "",
    host: "",
    telnetPort: "23",
    snmpPort: "161",
    snmpVersion: "2c",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function save() {
    if (!form.name.trim() || !form.host.trim()) {
      toast.error("Nama dan host OLT wajib diisi.");
      return;
    }
    addOlt({
      name: form.name,
      branchId: form.branchId,
      vendor: form.vendor,
      model: form.model,
      host: form.host,
      telnetPort: Number(form.telnetPort),
      snmpPort: Number(form.snmpPort),
      snmpVersion: form.snmpVersion,
      secretConfigured: true,
      status: "active",
    });
    toast.success("OLT ditambahkan.");
    onClose();
  }

  return { branches, form, set, save };
}
