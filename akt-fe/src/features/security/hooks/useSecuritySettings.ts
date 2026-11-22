"use client";

import { toast } from "sonner";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { useUsersStore } from "@/features/users/store/users-store";
import { useSettingsStore } from "@/features/settings/store/settings-store";

export function useSecuritySettings() {
  const session = useAuthStore((state) => state.session);
  const users = useUsersStore((state) => state.users);
  const updateUser = useUsersStore((state) => state.updateUser);
  const settings = useSettingsStore((state) => state.settings);
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
