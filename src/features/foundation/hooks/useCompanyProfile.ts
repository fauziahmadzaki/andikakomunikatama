"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useFoundationStore } from "@/features/foundation/store/foundation-store";

export function useCompanyProfile() {
  const company = useFoundationStore((state) => state.company);
  const updateCompany = useFoundationStore((state) => state.updateCompany);
  const [form, setForm] = useState(company);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleLogo(file: File | undefined) {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("logoUrl", String(reader.result));
    reader.readAsDataURL(file);
  }

  function save() {
    updateCompany(form);
    toast.success("Profil perusahaan disimpan.");
  }

  return { form, set, handleLogo, save };
}
