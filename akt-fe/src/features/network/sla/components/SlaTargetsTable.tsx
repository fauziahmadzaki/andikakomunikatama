"use client";

import {
  CodeIcon,
  HistoryIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import {
  DataTable,
  type DataTableColumn,
  type DataTableSelection,
} from "@/components/shared/DataTable";
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge";
import { UptimeKumaBar } from "./UptimeKumaBar";
import type { MonitoringTarget, TargetSlaSummary, TargetType } from "../types";

const statusToneMap: Record<"up" | "down" | "pending", StatusTone> = {
  up: "success",
  down: "danger",
  pending: "neutral",
};

const statusLabelMap: Record<"up" | "down" | "pending", string> = {
  up: "UP",
  down: "DOWN",
  pending: "PENDING",
};

const typeLabels: Record<TargetType, string> = {
  gateway: "Gateway",
  olt: "OLT",
  switch: "Switch",
  server: "Server",
  customer_pppoe: "PPPoE",
  customer_antena: "Pelanggan Antena",
  customer_dedicated: "Pelanggan Dedicated",
  other: "Device",
};

export function SlaTargetsTable({
  items,
  onViewScript,
  onViewIncidents,
  onSyncRouter,
  onDelete,
  syncingId,
  deletingId,
  selection,
}: {
  items: TargetSlaSummary[];
  onViewScript: (target: MonitoringTarget) => void;
  onViewIncidents: (target: MonitoringTarget) => void;
  onSyncRouter: (target: MonitoringTarget) => void;
  onDelete: (target: MonitoringTarget) => void;
  syncingId: string | null;
  deletingId: string | null;
  selection?: DataTableSelection;
}) {
  const columns: DataTableColumn<TargetSlaSummary>[] = [
    {
      key: "target",
      header: "Target",
      cell: (item) => (
        <div>
          <p className="font-medium text-foreground">{item.target.name}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {item.target.host}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Tipe",
      cell: (item) => (
        <span className="text-xs text-muted-foreground font-medium">
          {typeLabels[item.target.type] || item.target.type}
        </span>
      ),
    },
    {
      key: "router",
      header: "Router",
      cell: (item) => (
        <span className="text-xs text-foreground">
          {item.target.routerName || "Default"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item) => (
        <StatusBadge tone={statusToneMap[item.currentStatus]}>
          {statusLabelMap[item.currentStatus]}
        </StatusBadge>
      ),
    },
    {
      key: "uptimePercent",
      header: "SLA",
      cell: (item) => (
        <span
          className={`font-semibold text-sm ${
            item.uptimePercent >= 99
              ? "text-emerald-600 dark:text-[#5cdd8b]"
              : item.uptimePercent >= 95
              ? "text-amber-600 dark:text-amber-400"
              : "text-rose-600 dark:text-[#e74c3c]"
          }`}
        >
          {item.uptimePercent.toFixed(2)}%
        </span>
      ),
    },
    {
      key: "uptimeBar",
      header: "Uptime (30m)",
      cell: (item) => (
        <div className="w-56 min-w-[210px]">
          <UptimeKumaBar
            bars={item.bars}
            currentStatus={item.currentStatus}
            windowMinutes={item.windowMinutes || 30}
          />
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (item) => (
        <div className="flex items-center justify-end gap-1">
          {!item.target.netwatchSynced && (
            <ActionIconButton
              icon={RefreshCwIcon}
              label={syncingId === item.target.id ? "Sinkronisasi..." : "Sinkronkan ke router"}
              isDisabled={syncingId === item.target.id}
              onPress={() => onSyncRouter(item.target)}
            />
          )}
          <ActionIconButton
            icon={CodeIcon}
            label="Lihat script Netwatch"
            onPress={() => onViewScript(item.target)}
          />
          <ActionIconButton
            icon={HistoryIcon}
            label="Riwayat gangguan & insiden"
            onPress={() => onViewIncidents(item.target)}
          />
          <ActionIconButton
            icon={Trash2Icon}
            label="Hapus target monitoring"
            tone="destructive"
            isDisabled={deletingId === item.target.id}
            onPress={() => onDelete(item.target)}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={items}
      columns={columns}
      getRowKey={(row) => row.target.id}
      ariaLabel="Daftar monitoring target SLA"
      emptyMessage="Tidak ada target monitoring yang cocok dengan filter."
      selection={selection}
    />
  );
}
