import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useAuditStore } from "@/features/audit/store/audit-store";
import { seedAdapters, seedLogs } from "../data/seed";
import type { IntegrationAdapter, IntegrationLog } from "../data/types";

type IntegrationState = {
  adapters: IntegrationAdapter[];
  logs: IntegrationLog[];
  testAdapter: (id: string) => void;
  retryLog: (id: string) => void;
  resetIntegrations: () => void;
};

function id() {
  return crypto.randomUUID();
}

export const useIntegrationStore = create<IntegrationState>()(
  persist(
    (set, get) => ({
      adapters: seedAdapters,
      logs: seedLogs,

      testAdapter: (adapterId) => {
        const adapter = get().adapters.find((item) => item.id === adapterId);
        if (!adapter) {
          return;
        }
        const success = adapter.id !== "int-smtp";
        const now = new Date().toISOString();
        set((state) => ({
          adapters: state.adapters.map((item) =>
            item.id === adapterId
              ? {
                  ...item,
                  status: success ? "healthy" : "offline",
                  lastCheckAt: now,
                }
              : item
          ),
          logs: [
            {
              id: id(),
              adapter: adapter.name,
              action: "connection_test",
              status: success ? "success" : "failed",
              message: success ? "Connection test passed." : "Connection timeout.",
              createdAt: now,
            },
            ...state.logs,
          ],
        }));
        useAuditStore.getState().addAudit({
          action: success ? "integration.tested" : "integration.test_failed",
          entityType: "integration",
          entityId: adapter.name,
          actor: "NOC",
          branch: "JKT-01",
          description: success
            ? `Test ${adapter.name} berhasil.`
            : `Test ${adapter.name} gagal.`,
        });
      },

      retryLog: (logId) => {
        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === logId
              ? {
                  ...log,
                  status: "success",
                  message: "Retry succeeded.",
                  createdAt: new Date().toISOString(),
                }
              : log
          ),
        }));
      },

      resetIntegrations: () => set({ adapters: seedAdapters, logs: seedLogs }),
    }),
    { name: "muranet-integrations", skipHydration: true }
  )
);
