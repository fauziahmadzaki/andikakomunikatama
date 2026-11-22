import type { Router } from "./types";

export type RouterTrafficPoint = {
  time: string;
  rxBps: number;
  txBps: number;
};

export interface RouterInterfaceData {
  name: string;
  type: string;
  running: boolean;
  disabled: boolean;
  rxBps: number;
  txBps: number;
}

export interface RouterActiveClient {
  id: string;
  username: string;
  service: string;
  address: string;
  macAddress: string;
  uptime: string;
}

export type RouterTelemetry = {
  routerId: string;
  connected?: boolean;
  status?: "online" | "offline";
  message?: string;
  model: string;
  routerOsVersion: string;
  architecture: string;
  serialNumber: string;
  uptimeSeconds: number;
  cpuLoad: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  diskUsedPercent: number;
  temperatureC: number;
  rxBps: number;
  txBps: number;
  activeSessions: number;
  latencyMs: number;
  packetLossPercent: number;
  interfaces?: RouterInterfaceData[];
  activeClients?: RouterActiveClient[];
  history: RouterTrafficPoint[];
  updatedAt: string;
};

const MODEL_BY_ROUTER: Record<string, string> = {
  "rtr-jkt-01": "CCR2004-1G-12S+2XS",
  "rtr-jkt-02": "RB5009UG+S+",
  "rtr-bdg-01": "CCR1009-7G-1C-1S+",
  "rtr-sby-01": "RB4011iGS+RM",
};

const ARCHITECTURE_BY_ROUTER: Record<string, string> = {
  "rtr-jkt-01": "arm64",
  "rtr-jkt-02": "arm64",
  "rtr-bdg-01": "tile",
  "rtr-sby-01": "arm",
};

const MEMORY_BY_ROUTER: Record<string, number> = {
  "rtr-jkt-01": 4096,
  "rtr-jkt-02": 1024,
  "rtr-bdg-01": 2048,
  "rtr-sby-01": 1024,
};

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number) {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function timeLabel(offsetMs: number) {
  return new Date(Date.now() - offsetMs).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function buildHistory(
  rxBase: number,
  txBase: number,
  random: () => number
): RouterTrafficPoint[] {
  const count = 24;
  return Array.from({ length: count }, (_, index) => ({
    time: timeLabel((count - 1 - index) * 3000),
    rxBps: Math.max(1_000_000, Math.round(rxBase * (0.85 + random() * 0.3))),
    txBps: Math.max(500_000, Math.round(txBase * (0.85 + random() * 0.3))),
  }));
}

function jitter(
  value: number,
  ratio: number,
  min: number,
  max: number,
  decimals = 0
) {
  const next = value * (1 + (Math.random() - 0.5) * ratio);
  const clamped = Math.min(max, Math.max(min, next));
  const factor = 10 ** decimals;
  return Math.round(clamped * factor) / factor;
}

export function createRouterTelemetry(router: Router): RouterTelemetry {
  const random = seededRandom(hashString(router.id));
  const memoryTotalMb = MEMORY_BY_ROUTER[router.id] ?? 2048;
  const rxBase = 40_000_000 + random() * 160_000_000;
  const txBase = 10_000_000 + random() * 50_000_000;
  const history = buildHistory(rxBase, txBase, random);

  return {
    routerId: router.id,
    model: MODEL_BY_ROUTER[router.id] ?? "RB5009UG+S+",
    routerOsVersion: "7.16.2",
    architecture: ARCHITECTURE_BY_ROUTER[router.id] ?? "arm64",
    serialNumber: `SN-${router.id.replace(/[^a-z0-9]/gi, "").toUpperCase()}`,
    uptimeSeconds: Math.floor(86400 * (2 + random() * 40)),
    cpuLoad: Math.round(15 + random() * 35),
    memoryUsedMb: Math.round(memoryTotalMb * (0.35 + random() * 0.25)),
    memoryTotalMb,
    diskUsedPercent: Math.round(20 + random() * 30),
    temperatureC: Math.round(37 + random() * 10),
    rxBps: history[history.length - 1]?.rxBps ?? rxBase,
    txBps: history[history.length - 1]?.txBps ?? txBase,
    activeSessions: Math.round(20 + random() * 180),
    latencyMs: Math.round((2 + random() * 12) * 10) / 10,
    packetLossPercent: Math.round(random() * 50) / 100,
    history,
    updatedAt: new Date().toISOString(),
  };
}

export function nextRouterTelemetry(
  current: RouterTelemetry
): RouterTelemetry {
  const now = new Date();
  const rxBps = jitter(
    current.rxBps,
    0.32,
    500_000,
    1_000_000_000
  );
  const txBps = jitter(
    current.txBps,
    0.32,
    250_000,
    500_000_000
  );
  const point: RouterTrafficPoint = {
    time: now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    rxBps,
    txBps,
  };

  return {
    ...current,
    rxBps,
    txBps,
    cpuLoad: jitter(current.cpuLoad, 0.18, 5, 95),
    memoryUsedMb: jitter(
      current.memoryUsedMb,
      0.04,
      128,
      Math.max(129, current.memoryTotalMb - 64)
    ),
    temperatureC: jitter(current.temperatureC, 0.06, 30, 75),
    latencyMs: jitter(current.latencyMs, 0.3, 1, 80, 1),
    packetLossPercent: jitter(
      current.packetLossPercent,
      0.6,
      0,
      5,
      2
    ),
    activeSessions: jitter(current.activeSessions, 0.08, 1, 500),
    history: [...current.history.slice(-23), point],
    updatedAt: now.toISOString(),
  };
}
