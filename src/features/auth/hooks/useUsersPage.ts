"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import type { LocalUser } from "@/features/auth/data/users";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function useUsersPage() {
  const users = useAuthStore((state) => state.users);
  const toggleUser = useAuthStore((state) => state.toggleUser);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<LocalUser | null>(null);
  const [confirmUser, setConfirmUser] = useState<LocalUser | null>(null);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        `${user.name} ${user.email} ${user.username}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [query, users]
  );

  function openCreate() {
    setEditingUser(null);
    setDialogOpen(true);
  }

  function openEdit(user: LocalUser) {
    setEditingUser(user);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingUser(null);
  }

  function confirmToggle() {
    if (!confirmUser) {
      return;
    }
    toggleUser(confirmUser.id);
    toast.success(
      confirmUser.status === "active"
        ? "Pengguna dinonaktifkan."
        : "Pengguna diaktifkan."
    );
    setConfirmUser(null);
  }

  return {
    users,
    query,
    setQuery,
    filteredUsers,
    dialogOpen,
    editingUser,
    openCreate,
    openEdit,
    closeDialog,
    confirmUser,
    setConfirmUser,
    confirmToggle,
  };
}
