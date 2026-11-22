"use client";

import { ActivityIcon, RefreshCwIcon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  IntegrationAdapter,
  IntegrationLog,
  IntegrationStatus,
} from "@/features/integrations/data/types";
import { useIntegrationsPage } from "@/features/integrations/hooks/useIntegrationsPage";
import { formatDateTime } from "@/lib/format";

const tone: Record<IntegrationStatus, StatusTone> = {
  healthy: "success",
  degraded: "warning",
  offline: "danger",
};

export function IntegrationsPage() {
  const { adapters, logs, test, retry, stats } = useIntegrationsPage();

  const adapterColumns: DataTableColumn<IntegrationAdapter>[] = [
    {
      key: "name",
      header: "Adapter",
      cell: (adapter) => (
        <div>
          <p className="font-medium">{adapter.name}</p>
          <p className="text-xs text-muted-foreground">{adapter.type}</p>
        </div>
      ),
    },
    {
      key: "endpoint",
      header: "Endpoint",
      cell: (adapter) => (
        <span className="font-mono text-xs text-muted-foreground">
          {adapter.endpoint}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (adapter) => (
        <StatusBadge tone={tone[adapter.status]}>{adapter.status}</StatusBadge>
      ),
    },
    {
      key: "lastCheckAt",
      header: "Terakhir cek",
      cell: (adapter) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(adapter.lastCheckAt)}
        </span>
      ),
    },
    {
      key: "secretConfigured",
      header: "Secret",
      cell: (adapter) => (
        <StatusBadge tone={adapter.secretConfigured ? "success" : "warning"}>
          {adapter.secretConfigured ? "Configured" : "Missing"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (adapter) => (
        <ActionIconButton
          icon={ActivityIcon}
          label="Test koneksi adapter"
          onPress={() => test(adapter.id)}
        />
      ),
    },
  ];

  const logColumns: DataTableColumn<IntegrationLog>[] = [
    {
      key: "adapter",
      header: "Adapter",
      cell: (log) => <span className="font-medium">{log.adapter}</span>,
    },
    { key: "action", header: "Aksi" },
    {
      key: "status",
      header: "Status",
      cell: (log) => (
        <StatusBadge tone={log.status === "success" ? "success" : "danger"}>
          {log.status}
        </StatusBadge>
      ),
    },
    {
      key: "message",
      header: "Pesan",
      cell: (log) => (
        <span className="text-xs text-muted-foreground">{log.message}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Waktu",
      cell: (log) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(log.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (log) =>
        log.status === "failed" ? (
          <ActionIconButton
            icon={RefreshCwIcon}
            label="Retry integrasi"
            onPress={() => retry(log.id)}
          />
        ) : null,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Integrasi"
        description="Status adapter, connection test, dan log integrasi."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Adapter", value: stats.total },
          { label: "Healthy", value: stats.healthy },
          { label: "Degraded", value: stats.degraded },
          { label: "Offline", value: stats.offline },
        ].map((item) => (
          <Card key={item.label} className="gap-0 py-0">
            <CardContent className="space-y-1 p-5">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-bold tracking-tight">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Adapter</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable
            data={adapters}
            columns={adapterColumns}
            getRowKey={(adapter) => adapter.id}
            ariaLabel="Daftar integrasi"
            emptyMessage="Belum ada adapter."
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Log integrasi</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable
            data={logs}
            columns={logColumns}
            getRowKey={(log) => log.id}
            ariaLabel="Log integrasi"
            emptyMessage="Belum ada log."
          />
        </CardContent>
      </Card>
    </div>
  );
}
