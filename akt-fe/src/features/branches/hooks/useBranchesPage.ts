"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { Branch } from "@/features/branches/data/branches";
import { useBranchStore } from "@/features/branches/store/branch-store";

export function useBranchesPage() {
  const branches = useBranchStore((state) => state.branches);
  const fetchBranches = useBranchStore((state) => state.fetchBranches);
  const toggleBranch = useBranchStore((state) => state.toggleBranch);
  const deleteBranch = useBranchStore((state) => state.deleteBranch);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [confirmBranch, setConfirmBranch] = useState<Branch | null>(null);
  const [deleteConfirmBranch, setDeleteConfirmBranch] = useState<Branch | null>(null);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

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

  async function confirmToggle() {
    if (!confirmBranch) {
      return;
    }
    await toggleBranch(confirmBranch.id);
    toast.success(
      confirmBranch.isActive ? "Cabang dinonaktifkan." : "Cabang diaktifkan."
    );
    setConfirmBranch(null);
  }

  async function confirmDelete() {
    if (!deleteConfirmBranch) {
      return;
    }
    await deleteBranch(deleteConfirmBranch.id);
    toast.success(`Cabang ${deleteConfirmBranch.name} berhasil dihapus.`);
    setDeleteConfirmBranch(null);
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
    deleteConfirmBranch,
    setDeleteConfirmBranch,
    confirmDelete,
  };
}
