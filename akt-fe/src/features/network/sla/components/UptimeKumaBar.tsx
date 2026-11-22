"use client";

import type { UptimeBarItem } from "../types";

export function UptimeKumaBar({
  bars,
  currentStatus,
  windowMinutes = 30,
}: {
  bars: UptimeBarItem[];
  currentStatus: "up" | "down" | "pending";
  windowMinutes?: number;
  compact?: boolean;
}) {
  const leftLabel = `${windowMinutes || bars.length || 30}m`;

  return (
    <div className="w-full select-none">
      {/* Capsule pills matching Uptime Kuma */}
      <div className="flex w-full items-center gap-[2.5px] h-4.5">
        {bars.map((bar, idx) => {
          const isLatest = idx === bars.length - 1;
          const isDown = bar.status === "down" || (isLatest && currentStatus === "down");
          const isPending = bar.status === "pending";

          let colorClass = "bg-[#5cdd8b] hover:brightness-110";
          if (isDown) {
            colorClass = "bg-[#e74c3c] hover:brightness-110";
          } else if (isPending) {
            colorClass = "bg-muted-foreground/30";
          }

          const tooltipText = isDown
            ? `${bar.label}: Down (${bar.downtimeSeconds}s)`
            : `${bar.label}: Normal (100% Up)`;

          return (
            <div
              key={bar.key || idx}
              title={tooltipText}
              className={`h-full flex-1 rounded-full transition-colors cursor-pointer ${colorClass} ${
                isLatest && isDown ? "animate-pulse" : ""
              }`}
            />
          );
        })}
      </div>

      {/* Sub-label: 33m on left, now on right */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono mt-1 px-0.5">
        <span>{leftLabel}</span>
        <span>now</span>
      </div>
    </div>
  );
}
