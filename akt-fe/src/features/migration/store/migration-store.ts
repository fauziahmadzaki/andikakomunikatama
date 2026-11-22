import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useAuditStore } from "@/features/audit/store/audit-store";
import { seedSteps } from "../data/seed";
import type { MigrationStep } from "../data/types";

type MigrationState = {
  steps: MigrationStep[];
  lastRunAt: string | null;
  runDryRun: () => void;
  resetMigration: () => void;
};

export const useMigrationStore = create<MigrationState>()(
  persist(
    (set) => ({
      steps: seedSteps,
      lastRunAt: null,

      runDryRun: () => {
        set((state) => ({
          steps: state.steps.map((step) =>
            ["mig-03", "mig-04"].includes(step.id)
              ? { ...step, status: "completed", count: 12844 }
              : step
          ),
          lastRunAt: new Date().toISOString(),
        }));
        useAuditStore.getState().addAudit({
          action: "migration.dry_run",
          entityType: "migration",
          entityId: "dry-run",
          actor: "Migration Lead",
          branch: "JKT-01",
          description: "Dry-run migrasi dijalankan.",
        });
      },

      resetMigration: () => set({ steps: seedSteps, lastRunAt: null }),
    }),
    { name: "muranet-migration", skipHydration: true }
  )
);
