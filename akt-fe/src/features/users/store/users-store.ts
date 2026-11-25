import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useAuditStore } from "@/features/audit/store/audit-store";
import { defaultRolePermissions } from "../data/permissions";
import type { Employee } from "../data/employees";
import type { LocalUser, UserRole } from "../data/users";

import { generateUUID } from "@/lib/uuid";

type UsersState = {
  users: LocalUser[];
  employees: Employee[];
  rolePermissions: Record<UserRole, string[]>;
  addUser: (input: Omit<LocalUser, "id" | "lastLoginAt">) => void;
  updateUser: (id: string, patch: Partial<LocalUser>) => void;
  toggleUser: (id: string) => void;
  setRolePermissions: (role: UserRole, codes: string[]) => void;
  resetUsers: () => void;
};

function id() {
  return generateUUID();
}

function audit(action: string, entityId: string, description: string, branch: string) {
  useAuditStore.getState().addAudit({
    action,
    entityType: "user",
    entityId,
    actor: "Administrator",
    branch,
    description,
  });
}

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [],
      employees: [],
      rolePermissions: defaultRolePermissions,

      addUser: (input) => {
        const user: LocalUser = {
          ...input,
          id: id(),
          lastLoginAt: null,
        };
        set((state) => ({ users: [user, ...state.users] }));
        audit("user.created", user.username, `Pengguna ${user.name} ditambahkan.`, user.branchName);
      },

      updateUser: (userId, patch) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId ? { ...user, ...patch } : user
          ),
        }));
        const user = get().users.find((item) => item.id === userId);
        audit(
          "user.updated",
          user?.username ?? userId,
          `Pengguna ${user?.name ?? userId} diperbarui.`,
          user?.branchName ?? "JKT-01"
        );
      },

      toggleUser: (userId) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  status: user.status === "active" ? "inactive" : "active",
                }
              : user
          ),
        }));
        const user = get().users.find((item) => item.id === userId);
        audit(
          user?.status === "active" ? "user.activated" : "user.deactivated",
          user?.username ?? userId,
          `Status pengguna ${user?.name ?? userId} diubah.`,
          user?.branchName ?? "JKT-01"
        );
      },

      setRolePermissions: (role, codes) => {
        set((state) => ({
          rolePermissions: { ...state.rolePermissions, [role]: codes },
        }));
        audit(
          "role.permissions_updated",
          role,
          `Permission role ${role} diperbarui.`,
          "JKT-01"
        );
      },

      resetUsers: () => {
        set({
          users: [],
          employees: [],
          rolePermissions: defaultRolePermissions,
        });
      },
    }),
    {
      name: "muranet-users-v2",
      skipHydration: true,
      // Data lama di localStorage bisa berisi rolePermissions kosong.
      // Selalu lengkapi dengan permission default supaya menu admin tetap terbuka.
      merge: (persisted, current) => {
        const saved = persisted as Partial<UsersState> | undefined;

        return {
          ...current,
          ...saved,
          rolePermissions: {
            ...defaultRolePermissions,
            ...(saved?.rolePermissions ?? {}),
          },
        };
      },
    }
  )
);
