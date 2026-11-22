import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useAuditStore } from "@/features/audit/store/audit-store";
import { seedEmployees, type Employee } from "../data/employees";
import { defaultRolePermissions } from "../data/permissions";
import { localUsers, type LocalUser, type UserRole } from "../data/users";

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
  return crypto.randomUUID();
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
      users: localUsers,
      employees: seedEmployees,
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
          users: localUsers,
          employees: seedEmployees,
          rolePermissions: defaultRolePermissions,
        });
      },
    }),
    { name: "muranet-users", skipHydration: true }
  )
);
