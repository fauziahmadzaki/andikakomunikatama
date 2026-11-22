"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { Branch } from "@/features/branches/data/branches";
import { useBranchStore } from "@/features/branches/store/branch-store";

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
  const addBranch = useBranchStore((state) => state.addBranch);
  const updateBranch = useBranchStore((state) => state.updateBranch);
  const [form, setForm] = useState<BranchForm>(() => initialForm(branch));
  const [isSaving, setIsSaving] = useState(false);

  function set<K extends keyof BranchForm>(key: K, value: BranchForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("Kode dan nama cabang wajib diisi.");
      return;
    }

    setIsSaving(true);
    try {
      if (branch) {
        await updateBranch(branch.id, form);
        toast.success("Cabang berhasil diperbarui.");
      } else {
        await addBranch({ ...form, isActive: true });
        toast.success("Cabang berhasil ditambahkan.");
      }
      onClose();
    } catch {
      toast.error("Gagal menyimpan data cabang.");
    } finally {
      setIsSaving(false);
    }
  }

  return { form, set, save, isSaving, isEditing: Boolean(branch) };
}
