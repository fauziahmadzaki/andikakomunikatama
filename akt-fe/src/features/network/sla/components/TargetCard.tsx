"use client";

import { useState } from "react";
import {
  ActivityIcon,
  CheckCircle2Icon,
  ClockIcon,
  GlobeIcon,
  HistoryIcon,
  MoreVerticalIcon,
  NetworkIcon,
  RadioIcon,
  RefreshCwIcon,
  ServerIcon,
  TerminalIcon,
  Trash2Icon,
  UserCheckIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UptimeKumaBar } from "./UptimeKumaBar";
import type { TargetSlaSummary, TargetType } from "../types";

const typeLabels: Record<TargetType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  gateway: { label: "Gateway", icon: NetworkIcon },
  olt: { label: "OLT", icon: RadioIcon },
  switch: { label: "Switch", icon: ActivityIcon },
  server: { label: "Server", icon: ServerIcon },
  customer_pppoe: { label: "PPPoE", icon: UserCheckIcon },
  customer_antena: { label: "Pelanggan Antena", icon: UserCheckIcon },
  customer_dedicated: { label: "Pelanggan Dedicated", icon: UserCheckIcon },
  other: { label: "Device", icon: GlobeIcon },
};

export function TargetCard({
  item,
  onViewScript,
  onViewIncidents,
  onRefresh,
}: {
  item: TargetSlaSummary;
  onViewScript: () => void;
  onViewIncidents: () => void;
  onRefresh: () => void;
}) {
  const { target, currentStatus, uptimePercent, bars, lastIncident } = item;
  const [syncing, setSyncing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const typeConfig = typeLabels[target.type] || typeLabels.other;
  const TypeIcon = typeConfig.icon;

  const isUp = currentStatus === "up";
  const isDown = currentStatus === "down";

  const handleSyncNetwatch = async () => {
    setSyncing(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    try {
      const res = await fetch(`${apiUrl}/monitoring/targets/${target.id}/sync`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Rule Netwatch berhasil disinkronkan ke router.");
        onRefresh();
      } else {
        toast.error(json.message || "Gagal sinkron ke router.");
      }
    } catch {
      toast.error("Gagal terhubung ke backend.");
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus target monitoring "${target.name}"?`)) return;
    setDeleting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    try {
      const res = await fetch(`${apiUrl}/monitoring/targets/${target.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Target monitoring berhasil dihapus.");
        onRefresh();
      } else {
        toast.error(json.message || "Gagal menghapus target.");
      }
    } catch {
      toast.error("Gagal terhubung ke backend.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="gap-0 py-0 transition-all hover:shadow-md border-border">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-9 items-center justify-center rounded-lg border ${
              isDown
                ? "border-rose-500/30 bg-rose-500/10 text-rose-600"
                : isUp
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                : "border-border bg-muted text-muted-foreground"
            }`}
          >
            <TypeIcon className="size-4.5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm tracking-tight text-foreground">{target.name}</h3>
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                {target.host}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>{typeConfig.label}</span>
              <span>·</span>
              <span>Router: {target.routerName || "Default"}</span>
              <span>·</span>
              <span>Interval {target.intervalSeconds}s</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Uptime % */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span
                className={`text-lg font-bold tracking-tight ${
                  uptimePercent >= 99
                    ? "text-emerald-600 dark:text-emerald-400"
                    : uptimePercent >= 95
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {uptimePercent.toFixed(2)}%
              </span>
            </div>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">
              SLA 30 Hari
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center">
            {isDown ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                DOWN
              </span>
            ) : isUp ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-500" />
                UP
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-muted bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                PENDING
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3.5 p-5">
        {/* Visual Uptime Kuma Bar */}
        <UptimeKumaBar bars={bars} currentStatus={currentStatus} />

        {/* Footer actions & info */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="size-3.5" />
              {lastIncident ? (
                <span>
                  Insiden terakhir:{" "}
                  <strong>{new Date(lastIncident.startedAt).toLocaleDateString("id-ID")}</strong> (
                  {lastIncident.durationSeconds
                    ? `${Math.round(lastIncident.durationSeconds / 60)} mnt`
                    : "Masih berlangsung"}
                  )
                </span>
              ) : (
                <span>Tidak ada insiden tercatat</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onPress={onViewScript} className="h-7 px-2 text-xs gap-1">
              <TerminalIcon className="size-3.5" />
              Script Netwatch
            </Button>

            <Button variant="ghost" size="sm" onPress={onViewIncidents} className="h-7 px-2 text-xs gap-1">
              <HistoryIcon className="size-3.5" />
              Riwayat
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onPress={handleSyncNetwatch}
              isDisabled={syncing}
              className="h-7 px-2 text-xs gap-1"
            >
              <RefreshCwIcon className={`size-3.5 ${syncing ? "animate-spin" : ""}`} />
              Sync Router
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onPress={handleDelete}
              isDisabled={deleting}
              className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2Icon className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
