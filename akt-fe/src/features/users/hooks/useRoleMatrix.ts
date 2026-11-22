"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { UserRole } from "@/features/users/data/users";
import { useUsersStore } from "@/features/users/store/users-store";

const roles: UserRole[] = ["admin", "cs", "teknisi"];

export function useRoleMatrix() {
  const stored = useUsersStore((state) => state.rolePermissions);
  const setRolePermissions = useUsersStore(
    (state) => state.setRolePermissions
  );
  const [draft, setDraft] = useState(stored);

  function toggle(role: UserRole, code: string) {
    if (role === "admin") {
      return;
    }
    setDraft((current) => {
      const has = current[role].includes(code);
      return {
        ...current,
        [role]: has
          ? current[role].filter((item) => item !== code)
          : [...current[role], code],
      };
    });
  }

  function save() {
    roles.forEach((role) => setRolePermissions(role, draft[role]));
    toast.success("Permission role disimpan.");
  }

  return { draft, roles, toggle, save };
}
