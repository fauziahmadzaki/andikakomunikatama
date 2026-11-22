import { create } from "zustand";
import { persist } from "zustand/middleware";

import { seedAuditLogs, type AuditLog } from "../data/audit";

import { generateUUID } from "@/lib/uuid";

type AuditInput = Omit<AuditLog, "id" | "createdAt"> & {
  createdAt?: string;
};

type AuditState = {
  auditLogs: AuditLog[];
  addAudit: (input: AuditInput) => void;
  resetAudit: () => void;
};

function id() {
  return generateUUID();
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      auditLogs: seedAuditLogs,

      addAudit: (input) => {
        const entry: AuditLog = {
          ...input,
          id: id(),
          createdAt: input.createdAt ?? new Date().toISOString(),
        };
        set((state) => ({
          auditLogs: [entry, ...state.auditLogs].slice(0, 200),
        }));
      },

      resetAudit: () => {
        set({ auditLogs: seedAuditLogs });
      },
    }),
    { name: "muranet-audit", skipHydration: true }
  )
);
