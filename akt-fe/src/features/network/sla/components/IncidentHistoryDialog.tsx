"use client";

import { useEffect, useState } from "react";
import { AlertCircleIcon, CheckCircle2Icon, ClockIcon, HistoryIcon } from "lucide-react";

import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { MonitoringIncident, MonitoringTarget } from "../types";

export function IncidentHistoryDialog({
  target,
  open,
  onClose,
}: {
  target: MonitoringTarget | null;
  open: boolean;
  onClose: () => void;
}) {
  const [incidents, setIncidents] = useState<MonitoringIncident[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && target) {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      fetch(`${apiUrl}/monitoring/targets/${target.id}/incidents`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setIncidents(json.data);
          }
        })
        .catch((err) => console.warn("Gagal load incidents:", err))
        .finally(() => setLoading(false));
    }
  }, [open, target]);

  if (!target) return null;

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "-";
    if (seconds < 60) return `${seconds} detik`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins} mnt ${secs} dtk`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs} jam ${remMins} mnt`;
  };

  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <div className="space-y-4 max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <HistoryIcon className="size-5 text-primary" />
            <DialogTitle>Riwayat Insiden Gangguan</DialogTitle>
          </div>
          <DialogDescription>
            Log riwayat downtime dan pemulihan untuk <strong>{target.name}</strong> ({target.host}).
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Memuat riwayat insiden...
            </div>
          ) : incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-2 border border-dashed rounded-xl p-6">
              <CheckCircle2Icon className="size-8 text-emerald-500" />
              <p className="text-sm font-semibold">Tidak Ada Riwayat Gangguan</p>
              <p className="text-xs text-muted-foreground">
                Target ini beroperasi 100% normal tanpa insiden tercatat.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {incidents.map((inc) => {
                const isOngoing = inc.status === "ongoing";
                return (
                  <div
                    key={inc.id}
                    className={`rounded-xl border p-3.5 text-xs transition-all ${
                      isOngoing
                        ? "border-destructive/40 bg-destructive/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isOngoing ? (
                          <span className="flex size-2 rounded-full bg-rose-500 animate-pulse" />
                        ) : (
                          <CheckCircle2Icon className="size-4 text-emerald-500" />
                        )}
                        <span className="font-semibold text-sm">
                          {isOngoing ? "Gangguan Berlangsung" : "Gangguan Selesai (Pulih)"}
                        </span>
                      </div>
                      <StatusBadge tone={isOngoing ? "danger" : "success"}>
                        {isOngoing ? "ONGOING" : "RESOLVED"}
                      </StatusBadge>
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 gap-2 text-muted-foreground">
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-muted-foreground/80">
                          Mulai Padam
                        </span>
                        <span className="font-medium text-foreground">
                          {new Date(inc.startedAt).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-muted-foreground/80">
                          Waktu Pulih
                        </span>
                        <span className="font-medium text-foreground">
                          {inc.resolvedAt
                            ? new Date(inc.resolvedAt).toLocaleString("id-ID")
                            : "Masih berlangsung"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between border-t pt-2 text-muted-foreground text-[11px]">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="size-3.5" />
                        Durasi: <strong>{isOngoing ? "Sedang berjalan" : formatDuration(inc.durationSeconds)}</strong>
                      </span>
                      <span>Penyebab: {inc.cause || "ICMP timeout"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
