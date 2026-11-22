import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useAuditStore } from "@/features/audit/store/audit-store";
import type { Session } from "../data/session";

type AuthState = {
  session: Session | null;
  setSession: (session: Session) => void;
  logout: () => void;
  resetAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,

      setSession: (session) => set({ session }),

      logout: () => {
        const session = get().session;
        set({ session: null });
        if (session) {
          useAuditStore.getState().addAudit({
            action: "auth.logout",
            entityType: "user",
            entityId: session.id,
            actor: session.name,
            branch: session.branchName,
            description: "Logout.",
          });
        }
      },

      resetAuth: () => set({ session: null }),
    }),
    { name: "muranet-auth", skipHydration: true }
  )
);
