"use client";

import { ArrowLeftIcon, RefreshCwIcon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { NotificationLog } from "@/features/notifications/data/types";
import { useLogsPage } from "@/features/notifications/hooks/useNotifications";
import { formatDateTime } from "@/lib/format";

export function NotificationLogPage() {
  const { logs, retry } = useLogsPage();

  const columns: DataTableColumn<NotificationLog>[] = [
    {
      key: "channel",
      header: "Channel",
      cell: (log) => <StatusBadge tone="primary">{log.channel}</StatusBadge>,
    },
    { key: "recipient", header: "Penerima" },
    { key: "templateName", header: "Template" },
    {
      key: "sentAt",
      header: "Waktu",
      cell: (log) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(log.sentAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (log) => (
        <StatusBadge
          tone={
            log.status === "sent"
              ? "success"
              : log.status === "failed"
                ? "danger"
                : "warning"
          }
        >
          {log.status}
        </StatusBadge>
      ),
    },
    {
      key: "error",
      header: "Error",
      cell: (log) => (
        <span className="text-xs text-muted-foreground">{log.error ?? "-"}</span>
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
            label="Coba kirim ulang"
            onPress={() => retry(log.id)}
          />
        ) : null,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-3">
        <LinkButton
          href="/dashboard/notifikasi"
          variant="ghost"
          size="sm"
          className="-ml-2"
        >
          <ArrowLeftIcon />
          Kembali ke notifikasi
        </LinkButton>
        <PageHeader
          title="Log notifikasi"
          description="Riwayat pengiriman dan retry."
        />
      </div>
      <Card className="gap-0 py-0">
        <CardContent className="p-4">
          <DataTable
            data={logs}
            columns={columns}
            getRowKey={(log) => log.id}
            ariaLabel="Log notifikasi"
            emptyMessage="Belum ada log."
          />
        </CardContent>
      </Card>
    </div>
  );
}
