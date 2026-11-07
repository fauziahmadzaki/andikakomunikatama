"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import type { LocalUser } from "@/features/auth/data/users";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function useAccessReview() {
  const users = useAuthStore((state) => state.users);
  const toggleUser = useAuthStore((state) => state.toggleUser);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [confirmUser, setConfirmUser] = useState<LocalUser | null>(null);

  const summary = useMemo(
    () => ({
      total: users.length,
      active: users.filter((user) => user.status === "active").length,
      privileged: users.filter((user) => user.role === "admin").length,
      noLogin: users.filter((user) => !user.lastLoginAt).length,
    }),
    [users]
  );

  function review(userId: string) {
    setReviewed((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  }

  function confirmRevoke() {
    if (!confirmUser) {
      return;
    }
    toggleUser(confirmUser.id);
    setReviewed((current) =>
      current.includes(confirmUser.id) ? current : [...current, confirmUser.id]
    );
    toast.success("Akses pengguna dicabut.");
    setConfirmUser(null);
  }

  function finishReview() {
    toast.success(`${reviewed.length} pengguna ditandai selesai direview.`);
  }

  return {
    users,
    summary,
    reviewed,
    review,
    confirmUser,
    setConfirmUser,
    confirmRevoke,
    finishReview,
  };
}
