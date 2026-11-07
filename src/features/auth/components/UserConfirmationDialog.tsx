"use client";

import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import type { LocalUser } from "@/features/auth/data/users";

export function UserConfirmationDialog({
  user,
  onConfirm,
  onCancel,
}: {
  user: LocalUser | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <ConfirmationDialog
      open={Boolean(user)}
      title={user?.status === "active" ? "Nonaktifkan pengguna?" : "Aktifkan pengguna?"}
      description={
        user?.status === "active"
          ? "Pengguna tidak bisa login dan semua sesinya dicabut."
          : "Pengguna bisa kembali login sesuai role dan cabangnya."
      }
      confirmLabel={user?.status === "active" ? "Nonaktifkan" : "Aktifkan"}
      destructive={user?.status === "active"}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
