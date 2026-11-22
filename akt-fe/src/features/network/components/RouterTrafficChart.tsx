"use client";

import type { RouterTrafficPoint } from "@/features/network/data/router-telemetry";
import { formatBitRate } from "@/lib/format";

const WIDTH = 640;
const HEIGHT = 220;
const PAD_X = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

export function RouterTrafficChart({
  points,
}: {
  points: RouterTrafficPoint[];
}) {
  if (points.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Belum ada data traffic.
      </div>
    );
  }

  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const max = Math.max(
    1,
    ...points.flatMap((point) => [point.rxBps, point.txBps])
  );
  const xFor = (index: number) =>
    points.length <= 1
      ? PAD_X
      : PAD_X + (index / (points.length - 1)) * (WIDTH - PAD_X * 2);
  const yFor = (value: number) =>
    PAD_TOP + plotHeight - (value / max) * plotHeight;
  const bottom = PAD_TOP + plotHeight;

  function linePath(value: (point: RouterTrafficPoint) => number) {
    return points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${xFor(index)} ${yFor(value(point))}`
      )
      .join(" ");
  }

  const rxPath = linePath((point) => point.rxBps);
  const txPath = linePath((point) => point.txBps);
  const rxArea = `${rxPath} L ${xFor(points.length - 1)} ${bottom} L ${xFor(0)} ${bottom} Z`;
  const gridRatios = [0, 0.5, 1];
  const xLabelIndexes = Array.from(
    new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])
  );

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-56 w-full"
        role="img"
        aria-label="Grafik realtime traffic router"
      >
        <g style={{ stroke: "var(--color-border)" }} strokeWidth="1">
          {gridRatios.map((ratio) => {
            const y = PAD_TOP + plotHeight - ratio * plotHeight;
            return (
              <line
                key={ratio}
                x1={PAD_X}
                x2={WIDTH - PAD_X}
                y1={y}
                y2={y}
              />
            );
          })}
        </g>

        <g
          style={{ fill: "var(--color-muted-foreground)" }}
          fontSize="10"
        >
          {gridRatios.map((ratio) => {
            const y = PAD_TOP + plotHeight - ratio * plotHeight;
            return (
              <text key={ratio} x={PAD_X} y={y - 4}>
                {formatBitRate(max * ratio)}
              </text>
            );
          })}
          {xLabelIndexes.map((index) => (
            <text
              key={index}
              x={xFor(index)}
              y={HEIGHT - 8}
              textAnchor={
                index === 0
                  ? "start"
                  : index === points.length - 1
                    ? "end"
                    : "middle"
              }
            >
              {points[index]?.time}
            </text>
          ))}
        </g>

        <path d={rxArea} style={{ fill: "var(--color-chart-1)" }} opacity="0.1" />
        <path
          d={rxPath}
          fill="none"
          style={{ stroke: "var(--color-chart-1)" }}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={txPath}
          fill="none"
          style={{ stroke: "var(--color-chart-2)" }}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: "var(--color-chart-1)" }}
          />
          RX
        </span>
        <span className="flex items-center gap-2">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: "var(--color-chart-2)" }}
          />
          TX
        </span>
      </div>
    </div>
  );
}
