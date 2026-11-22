"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { RouterTelemetry } from "@/features/network/data/router-telemetry";
import { formatUptime } from "@/lib/format";
import { cn } from "@/lib/utils";

function barTone(percent: number) {
  if (percent >= 85) {
    return "bg-destructive";
  }
  if (percent >= 70) {
    return "bg-amber-500";
  }
  return "bg-emerald-500";
}

function MetricCard({
  label,
  value,
  percent,
}: {
  label: string;
  value: string;
  percent?: number;
}) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-3 p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-bold tracking-tight">{value}</p>
        {typeof percent === "number" ? (
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", barTone(percent))}
              style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function RouterHealthCards({
  telemetry,
}: {
  telemetry: RouterTelemetry | null;
}) {
  const memoryPercent = telemetry
    ? Math.round((telemetry.memoryUsedMb / telemetry.memoryTotalMb) * 100)
    : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="CPU load"
        value={telemetry ? `${telemetry.cpuLoad}%` : "-"}
        percent={telemetry?.cpuLoad}
      />
      <MetricCard
        label="Memory"
        value={
          telemetry
            ? `${telemetry.memoryUsedMb}/${telemetry.memoryTotalMb} MB`
            : "-"
        }
        percent={telemetry ? memoryPercent : undefined}
      />
      <MetricCard
        label="Disk usage"
        value={telemetry ? `${telemetry.diskUsedPercent}%` : "-"}
        percent={telemetry?.diskUsedPercent}
      />
      <MetricCard
        label="Temperature"
        value={telemetry ? `${telemetry.temperatureC}°C` : "-"}
        percent={
          telemetry ? Math.min(100, (telemetry.temperatureC / 80) * 100) : undefined
        }
      />
      <MetricCard
        label="Latency"
        value={telemetry ? `${telemetry.latencyMs} ms` : "-"}
      />
      <MetricCard
        label="Packet loss"
        value={telemetry ? `${telemetry.packetLossPercent}%` : "-"}
      />
      <MetricCard
        label="Active sessions"
        value={telemetry ? String(telemetry.activeSessions) : "-"}
      />
      <MetricCard
        label="Uptime"
        value={telemetry ? formatUptime(telemetry.uptimeSeconds) : "-"}
      />
    </div>
  );
}
