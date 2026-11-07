import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useFoundationStore } from "@/features/foundation/store/foundation-store";
import { defaultRolePermissions } from "../data/permissions";
import {
  localUsers,
  type LocalUser,
  type Session,
  type UserRole,
} from "../data/users";

type LoginResult = { ok: true } | { ok: false; error: string };

type AuthState = {
  session: Session | null;
  users: LocalUser[];
  rolePermissions: Record<UserRole, string[]>;
  login: (identifier: string, password: string) => LoginResult;
  logout: () => void;
  addUser: (input: Omit<LocalUser, "id" | "lastLoginAt">) => void;
  updateUser: (id: string, patch: Partial<LocalUser>) => void;
  toggleUser: (id: string) => void;
  setRolePermissions: (role: UserRole, codes: string[]) => void;
  resetAuth: () => void;
};

function now() {
  return new Date().toISOString();
}

function id() {
  return crypto.randomUUID();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      users: localUsers,
      rolePermissions: defaultRolePermissions,

      login: (identifier, password) => {
        const normalized = identifier.trim().toLowerCase();
        const user = get().users.find(
          (item) =>
            (item.email.toLowerCase() === normalized ||
              item.username.toLowerCase() === normalized) &&
            item.password === password
        );

        if (!user) {
          useFoundationStore.getState().addAudit({
            action: "auth.login_failed",
            entityType: "user",
            entityId: identifier,
            actor: identifier,
            branch: "JKT-01",
            description: "Percobaan login gagal.",
          });
          return { ok: false, error: "Email/ID atau kata sandi salah." };
        }

        if (user.status !== "active") {
          return { ok: false, error: "Akun tidak aktif. Hubungi administrator." };
        }

        const session: Session = {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          branchId: user.branchId,
          branchName: user.branchName,
        };

        set((state) => ({
          session,
          users: state.users.map((item) =>
            item.id === user.id ? { ...item, lastLoginAt: now() } : item
          ),
        }));

        useFoundationStore.getState().addAudit({
          action: "auth.login_succeeded",
          entityType: "user",
          entityId: user.id,
          actor: user.name,
          branch: user.branchName,
          description: "Login berhasil.",
        });

        return { ok: true };
      },

      logout: () => {
        const session = get().session;
        set({ session: null });
        if (session) {
          useFoundationStore.getState().addAudit({
            action: "auth.logout",
            entityType: "user",
            entityId: session.id,
            actor: session.name,
            branch: session.branchName,
            description: "Logout.",
          });
        }
      },

      addUser: (input) => {
        const user: LocalUser = {
          ...input,
          id: id(),
          lastLoginAt: null,
        };
        set((state) => ({ users: [user, ...state.users] }));
        useFoundationStore.getState().addAudit({
          action: "user.created",
          entityType: "user",
          entityId: user.username,
          actor: get().session?.name ?? "Administrator",
          branch: user.branchName,
          description: `Pengguna ${user.name} ditambahkan.`,
        });
      },

      updateUser: (userId, patch) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId ? { ...user, ...patch } : user
          ),
        }));
        const user = get().users.find((item) => item.id === userId);
        useFoundationStore.getState().addAudit({
          action: "user.updated",
          entityType: "user",
          entityId: user?.username ?? userId,
          actor: get().session?.name ?? "Administrator",
          branch: user?.branchName ?? "JKT-01",
          description: `Pengguna ${user?.name ?? userId} diperbarui.`,
        });
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
        useFoundationStore.getState().addAudit({
          action: user?.status === "active" ? "user.activated" : "user.deactivated",
          entityType: "user",
          entityId: user?.username ?? userId,
          actor: get().session?.name ?? "Administrator",
          branch: user?.branchName ?? "JKT-01",
          description: `Status pengguna ${user?.name ?? userId} diubah.`,
        });
      },

      setRolePermissions: (role, codes) => {
        set((state) => ({
          rolePermissions: { ...state.rolePermissions, [role]: codes },
        }));
        useFoundationStore.getState().addAudit({
          action: "role.permissions_updated",
          entityType: "role",
          entityId: role,
          actor: get().session?.name ?? "Administrator",
          branch: "JKT-01",
          description: `Permission role ${role} diperbarui.`,
        });
      },

      resetAuth: () => {
        set({
          session: null,
          users: localUsers,
          rolePermissions: defaultRolePermissions,
        });
      },
    }),
    { name: "muranet-auth", skipHydration: true }
  )
);

export function can(
  session: Session | null,
  rolePermissions: Record<UserRole, string[]>,
  code: string
) {
  if (!session) {
    return false;
  }

  return rolePermissions[session.role]?.includes(code) ?? false;
}
