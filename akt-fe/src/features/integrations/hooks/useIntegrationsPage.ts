"use client";

import { toast } from "sonner";

import { useIntegrationStore } from "@/features/integrations/store/integration-store";

export function useIntegrationsPage() {
  const adapters = useIntegrationStore((state) => state.adapters);
  const logs = useIntegrationStore((state) => state.logs);
  const testAdapter = useIntegrationStore((state) => state.testAdapter);
  const retryLog = useIntegrationStore((state) => state.retryLog);

  function test(id: string) {
    testAdapter(id);
    toast.success("Connection test dijalankan.");
  }

  function retry(id: string) {
    retryLog(id);
    toast.success("Log dicoba ulang.");
  }

  return {
    adapters,
    logs,
    test,
    retry,
    stats: {
      total: adapters.length,
      healthy: adapters.filter((adapter) => adapter.status === "healthy").length,
      degraded: adapters.filter((adapter) => adapter.status === "degraded")
        .length,
      offline: adapters.filter((adapter) => adapter.status === "offline").length,
    },
  };
}
