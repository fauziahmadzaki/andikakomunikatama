"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { Branch } from "@/features/foundation/data/types";
import { useFoundationStore } from "@/features/foundation/store/foundation-store";

export function useBranchesPage() {
  const branches = useFoundationStore((state) => state.branches);
  const toggleBranch = useFoundationStore((state) => state.toggleBranch);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [confirmBranch, setConfirmBranch] = useState<Branch | null>(null);

  function openCreate() {
    setEditingBranch(null);
    setDialogOpen(true);
  }

  function openEdit(branch: Branch) {
    setEditingBranch(branch);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingBranch(null);
  }

  function confirmToggle() {
    if (!confirmBranch) {
      return;
    }
    toggleBranch(confirmBranch.id);
    toast.success(
      confirmBranch.isActive ? "Cabang dinonaktifkan." : "Cabang diaktifkan."
    );
    setConfirmBranch(null);
  }

  return {
    branches,
    dialogOpen,
    editingBranch,
    openCreate,
    openEdit,
    closeDialog,
    confirmBranch,
    setConfirmBranch,
    confirmToggle,
  };
}
