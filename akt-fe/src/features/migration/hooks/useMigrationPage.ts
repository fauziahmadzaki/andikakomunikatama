"use client";

import { toast } from "sonner";

import { useMigrationStore } from "@/features/migration/store/migration-store";

export function useMigrationPage() {
  const steps = useMigrationStore((state) => state.steps);
  const lastRunAt = useMigrationStore((state) => state.lastRunAt);
  const runDryRun = useMigrationStore((state) => state.runDryRun);

  const completed = steps.filter((step) => step.status === "completed").length;

  function run() {
    runDryRun();
    toast.success("Dry-run migrasi dijalankan.");
  }

  return {
    steps,
    lastRunAt,
    progress: Math.round((completed / steps.length) * 100),
    run,
  };
}
