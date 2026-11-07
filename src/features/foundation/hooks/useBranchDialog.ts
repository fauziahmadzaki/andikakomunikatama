"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { Branch } from "@/features/foundation/data/types";
import { useFoundationStore } from "@/features/foundation/store/foundation-store";

type BranchForm = {
  code: string;
  name: string;
  phone: string;
  address: string;
  isHeadOffice: boolean;
};

function initialForm(branch: Branch | null): BranchForm {
  return {
    code: branch?.code ?? "",
    name: branch?.name ?? "",
    phone: branch?.phone ?? "",
    address: branch?.address ?? "",
    isHeadOffice: branch?.isHeadOffice ?? false,
  };
}

export function useBranchDialog({
  branch,
  onClose,
}: {
  branch: Branch | null;
  onClose: () => void;
}) {
  const addBranch = useFoundationStore((state) => state.addBranch);
  const updateBranch = useFoundationStore((state) => state.updateBranch);
  const [form, setForm] = useState<BranchForm>(() => initialForm(branch));

  function set<K extends keyof BranchForm>(key: K, value: BranchForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function save() {
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("Kode dan nama cabang wajib diisi.");
      return;
    }

    if (branch) {
      updateBranch(branch.id, form);
      toast.success("Cabang diperbarui.");
    } else {
      addBranch({ ...form, isActive: true });
      toast.success("Cabang ditambahkan.");
    }

    onClose();
  }

  return { form, set, save, isEditing: Boolean(branch) };
}
