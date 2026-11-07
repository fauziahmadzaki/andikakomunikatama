"use client";

import { toast } from "sonner";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { useFoundationStore } from "@/features/foundation/store/foundation-store";

export function useSecuritySettings() {
  const session = useAuthStore((state) => state.session);
  const users = useAuthStore((state) => state.users);
  const updateUser = useAuthStore((state) => state.updateUser);
  const settings = useFoundationStore((state) => state.settings);
  const currentUser = users.find((user) => user.id === session?.id);
  const security = settings.find((group) => group.id === "security");

  function toggleTwoFactor() {
    if (!currentUser) {
      return;
    }
    updateUser(currentUser.id, {
      twoFactorEnabled: !currentUser.twoFactorEnabled,
    });
    toast.success(
      currentUser.twoFactorEnabled
        ? "2FA dinonaktifkan untuk sesi demo."
        : "2FA diaktifkan untuk sesi demo."
    );
  }

  return { session, currentUser, security, toggleTwoFactor };
}
