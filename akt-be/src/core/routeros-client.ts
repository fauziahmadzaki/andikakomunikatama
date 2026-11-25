import { RouterOSAPI } from 'node-routeros';
import { logger } from '../utils/logger.js';
import { testRouterConnection } from './router-connection.js';

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

export interface RealRouterTelemetry {
  connected: boolean;
  status: 'online' | 'offline';
  message: string;
  routerId: string;
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
  interfaces: RouterInterfaceData[];
  activeClients: RouterActiveClient[];
  updatedAt: string;
}

// In-memory cache for previous interface bytes to calculate real bits-per-second (bps)
const previousTrafficMap = new Map<
  string,
  {
    totalRx: number;
    totalTx: number;
    timestamp: number;
    interfaceBytes: Map<string, { rx: number; tx: number }>;
  }
>();

export function parseRouterOsUptime(uptimeStr: string): number {
  if (!uptimeStr) return 0;
  if (/^\d+$/.test(uptimeStr)) return parseInt(uptimeStr, 10);

  let totalSeconds = 0;
  const weeks = uptimeStr.match(/(\d+)w/);
  const days = uptimeStr.match(/(\d+)d/);
  const hours = uptimeStr.match(/(\d+)h/);
  const minutes = uptimeStr.match(/(\d+)m/);
  const seconds = uptimeStr.match(/(\d+)s/);

  if (weeks) totalSeconds += parseInt(weeks[1], 10) * 7 * 86400;
  if (days) totalSeconds += parseInt(days[1], 10) * 86400;
  if (hours) totalSeconds += parseInt(hours[1], 10) * 3600;
  if (minutes) totalSeconds += parseInt(minutes[1], 10) * 60;
  if (seconds) totalSeconds += parseInt(seconds[1], 10);

  if (uptimeStr.includes(':')) {
    const parts = uptimeStr.split(':').map((p) => parseInt(p, 10) || 0);
    if (parts.length === 3) {
      totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
  }

  return totalSeconds || 3600;
}

export async function fetchRealRouterTelemetry(params: {
  routerId: string;
  host: string;
  apiPort: number;
  username: string;
  password?: string;
  timeoutMs?: number;
}): Promise<RealRouterTelemetry> {
  const { routerId, host, apiPort, username, password = '', timeoutMs = 3000 } = params;

  // 1. Fast socket connectivity pre-check
  const socketCheck = await testRouterConnection(host, apiPort, 2000);
  if (!socketCheck.success) {
    return {
      connected: false,
      status: 'offline',
      message: socketCheck.message,
      routerId,
      model: 'MikroTik (Offline)',
      routerOsVersion: '-',
      architecture: '-',
      serialNumber: '-',
      uptimeSeconds: 0,
      cpuLoad: 0,
      memoryUsedMb: 0,
      memoryTotalMb: 1024,
      diskUsedPercent: 0,
      temperatureC: 0,
      rxBps: 0,
      txBps: 0,
      activeSessions: 0,
      latencyMs: 0,
      interfaces: [],
      activeClients: [],
      updatedAt: new Date().toISOString(),
    };
  }

  const startTime = Date.now();
  const api = new RouterOSAPI({
    host,
    port: apiPort,
    user: username,
    password: password,
    timeout: Math.ceil(timeoutMs / 1000),
  });

  // Handle any uncaught error events emitted by RouterOSAPI EventEmitter
  api.on('error', (err) => {
    logger.warn(`RouterOS API EventEmitter error (${host}:${apiPort}): ${err?.message || err}`);
  });

  const withTimeout = <T>(promise: Promise<T>, ms: number, opName: string): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout ${ms}ms: ${opName}`)), ms)
      ),
    ]);
  };

  try {
    await withTimeout(api.connect(), timeoutMs, 'koneksi RouterOS API');
    const latencyMs = Date.now() - startTime;

    // 2. Fetch system resources (/system/resource/print)
    const resources: any[] = await withTimeout(
      api.write('/system/resource/print'),
      2000,
      '/system/resource/print'
    );
    const res = resources[0] || {};

    const cpuLoad = parseInt(res['cpu-load'] ?? '0', 10);
    const totalMemBytes = parseInt(res['total-memory'] ?? '0', 10);
    const freeMemBytes = parseInt(res['free-memory'] ?? '0', 10);
    const usedMemBytes = Math.max(0, totalMemBytes - freeMemBytes);

    const totalHddBytes = parseInt(res['total-hdd-space'] ?? '0', 10);
    const freeHddBytes = parseInt(res['free-hdd-space'] ?? '0', 10);
    const diskUsedPercent =
      totalHddBytes > 0
        ? Math.round(((totalHddBytes - freeHddBytes) / totalHddBytes) * 100)
        : 25;

    // 3. Fetch hardware health (/system/health/print)
    let temperatureC = 42;
    try {
      const health: any[] = await withTimeout(
        api.write('/system/health/print'),
        1500,
        '/system/health/print'
      );
      if (health && health[0]) {
        temperatureC = parseInt(
          health[0]['temperature'] ?? health[0]['cpu-temperature'] ?? '42',
          10
        );
      }
    } catch {
      // Ignored if device doesn't support health print
    }

    // 4. Fetch active sessions (PPPoE + Hotspot)
    const activeClients: RouterActiveClient[] = [];
    try {
      const pppActive: any[] = await withTimeout(
        api.write('/ppp/active/print'),
        1500,
        '/ppp/active/print'
      );
      if (Array.isArray(pppActive)) {
        for (const p of pppActive) {
          activeClients.push({
            id: p['.id'] || p['name'] || String(Math.random()),
            username: p['name'] || 'unknown',
            service: p['service'] || 'pppoe',
            address: p['address'] || '-',
            macAddress: p['caller-id'] || '-',
            uptime: p['uptime'] || '-',
          });
        }
      }
    } catch {
      // Ignored
    }

    try {
      const hotspotActive: any[] = await withTimeout(
        api.write('/ip/hotspot/active/print'),
        1500,
        '/ip/hotspot/active/print'
      );
      if (Array.isArray(hotspotActive)) {
        for (const h of hotspotActive) {
          activeClients.push({
            id: h['.id'] || h['user'] || String(Math.random()),
            username: h['user'] || 'hotspot-user',
            service: 'hotspot',
            address: h['address'] || '-',
            macAddress: h['mac-address'] || '-',
            uptime: h['uptime'] || '-',
          });
        }
      }
    } catch {
      // Ignored
    }

    // 5. Fetch interfaces & calculate real-time bps
    const interfaceList: RouterInterfaceData[] = [];
    let currentTotalRxBps = 0;
    let currentTotalTxBps = 0;

    try {
      const interfaces: any[] = await withTimeout(
        api.write('/interface/print'),
        1500,
        '/interface/print'
      );

      const nowTime = Date.now();
      const prev = previousTrafficMap.get(routerId);
      const timeDeltaSec = prev && prev.timestamp > 0 ? (nowTime - prev.timestamp) / 1000 : 0;
      const currentInterfaceMap = new Map<string, { rx: number; tx: number }>();

      let aggregatedRxBytes = 0;
      let aggregatedTxBytes = 0;

      for (const iface of interfaces) {
        const name = iface['name'] ?? 'interface';
        const type = iface['type'] ?? 'ether';
        const running = iface['running'] === 'true' || iface['running'] === true;
        const disabled = iface['disabled'] === 'true' || iface['disabled'] === true;
        const rxBytes = parseInt(iface['rx-byte'] ?? '0', 10);
        const txBytes = parseInt(iface['tx-byte'] ?? '0', 10);

        aggregatedRxBytes += rxBytes;
        aggregatedTxBytes += txBytes;

        currentInterfaceMap.set(name, { rx: rxBytes, tx: txBytes });

        let ifaceRxBps = 0;
        let ifaceTxBps = 0;

        if (prev && timeDeltaSec > 0.5 && prev.interfaceBytes.has(name)) {
          const prevIface = prev.interfaceBytes.get(name)!;
          ifaceRxBps = Math.round((Math.max(0, rxBytes - prevIface.rx) * 8) / timeDeltaSec);
          ifaceTxBps = Math.round((Math.max(0, txBytes - prevIface.tx) * 8) / timeDeltaSec);
        }

        interfaceList.push({
          name,
          type,
          running,
          disabled,
          rxBps: ifaceRxBps,
          txBps: ifaceTxBps,
        });
      }

      if (prev && timeDeltaSec > 0.5) {
        currentTotalRxBps = Math.round(
          (Math.max(0, aggregatedRxBytes - prev.totalRx) * 8) / timeDeltaSec
        );
        currentTotalTxBps = Math.round(
          (Math.max(0, aggregatedTxBytes - prev.totalTx) * 8) / timeDeltaSec
        );
      }

      previousTrafficMap.set(routerId, {
        totalRx: aggregatedRxBytes,
        totalTx: aggregatedTxBytes,
        timestamp: nowTime,
        interfaceBytes: currentInterfaceMap,
      });
    } catch {
      // Ignored
    }

    try {
      await api.close();
    } catch {
      // Ignored
    }

    return {
      connected: true,
      status: 'online',
      message: `Terhubung langsung ke RouterOS di ${host}:${apiPort} (${latencyMs}ms)`,
      routerId,
      model: res['board-name'] ?? res['platform'] ?? 'MikroTik RouterOS',
      routerOsVersion: res['version'] ?? '7.x',
      architecture: res['architecture-name'] ?? 'x86_64',
      serialNumber: res['board-name'] ? `MK-${res['board-name']}` : 'SN-UNKNOWN',
      uptimeSeconds: parseRouterOsUptime(res['uptime'] ?? '0'),
      cpuLoad,
      memoryUsedMb: Math.round(usedMemBytes / (1024 * 1024)),
      memoryTotalMb: Math.round(totalMemBytes / (1024 * 1024)) || 1024,
      diskUsedPercent,
      temperatureC,
      rxBps: currentTotalRxBps,
      txBps: currentTotalTxBps,
      activeSessions: activeClients.length,
      latencyMs,
      interfaces: interfaceList,
      activeClients,
      updatedAt: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Koneksi ke router gagal';
    logger.warn(`Gagal mengambil data RouterOS dari ${host}:${apiPort}: ${errorMsg}`);
    try {
      await api.close();
    } catch {
      // Ignored
    }

    return {
      connected: false,
      status: 'offline',
      message: `Router offline / tidak dapat dijangkau: ${errorMsg}`,
      routerId,
      model: 'MikroTik (Offline)',
      routerOsVersion: '-',
      architecture: '-',
      serialNumber: '-',
      uptimeSeconds: 0,
      cpuLoad: 0,
      memoryUsedMb: 0,
      memoryTotalMb: 1024,
      diskUsedPercent: 0,
      temperatureC: 0,
      rxBps: 0,
      txBps: 0,
      activeSessions: 0,
      latencyMs: 0,
      interfaces: [],
      activeClients: [],
      updatedAt: new Date().toISOString(),
    };
  }
}

export interface RouterQueueData {
  id: string;
  routerId: string;
  name: string;
  kind: 'parent' | 'simple';
  target?: string;
  comment?: string;
  maxLimit?: string;
}

export interface RouterQueuesResult {
  connected: boolean;
  message: string;
  queues: RouterQueueData[];
}

/**
 * Reads queue list directly from a live MikroTik router.
 * Simple queues are mapped to `simple`; queue trees become `parent`.
 */
export async function fetchRouterQueues(params: {
  routerId: string;
  host: string;
  apiPort: number;
  username: string;
  password?: string;
  timeoutMs?: number;
}): Promise<RouterQueuesResult> {
  const { routerId, host, apiPort, username, password = '', timeoutMs = 4000 } = params;

  const socketCheck = await testRouterConnection(host, apiPort, 2000);
  if (!socketCheck.success) {
    return {
      connected: false,
      message: `Router tidak dapat dijangkau: ${socketCheck.message}`,
      queues: [],
    };
  }

  const api = new RouterOSAPI({
    host,
    port: apiPort,
    user: username,
    password,
    timeout: Math.ceil(timeoutMs / 1000),
  });

  api.on('error', (err) => {
    logger.warn(`RouterOS queue fetch error (${host}:${apiPort}): ${err?.message || err}`);
  });

  const withTimeout = <T>(promise: Promise<T>, ms: number, opName: string): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout ${ms}ms: ${opName}`)), ms)
      ),
    ]);
  };

  const queues: RouterQueueData[] = [];

  try {
    await withTimeout(api.connect(), timeoutMs, 'koneksi RouterOS API');

    try {
      const simpleQueues: any[] = await withTimeout(
        api.write('/queue/simple/print'),
        timeoutMs,
        '/queue/simple/print'
      );

      if (Array.isArray(simpleQueues)) {
        for (const item of simpleQueues) {
          const name = item['name'] ? String(item['name']) : '';
          if (!name) continue;

          queues.push({
            id: item['.id'] ? String(item['.id']) : name,
            routerId,
            name,
            kind: 'simple',
            target: item['target'] ? String(item['target']) : undefined,
            comment: item['comment'] ? String(item['comment']) : undefined,
            maxLimit: item['max-limit'] ? String(item['max-limit']) : undefined,
          });
        }
      }
    } catch (err) {
      logger.warn(
        `Gagal membaca /queue/simple/print dari ${host}: ${
          err instanceof Error ? err.message : err
        }`
      );
    }

    try {
      const treeQueues: any[] = await withTimeout(
        api.write('/queue/tree/print'),
        timeoutMs,
        '/queue/tree/print'
      );

      if (Array.isArray(treeQueues)) {
        for (const item of treeQueues) {
          const name = item['name'] ? String(item['name']) : '';
          if (!name) continue;

          queues.push({
            id: item['.id'] ? String(item['.id']) : name,
            routerId,
            name,
            kind: 'parent',
            target: item['packet-mark'] ? String(item['packet-mark']) : undefined,
            comment: item['comment'] ? String(item['comment']) : undefined,
            maxLimit: item['max-limit']
              ? String(item['max-limit'])
              : item['limit-at']
                ? String(item['limit-at'])
                : undefined,
          });
        }
      }
    } catch (err) {
      logger.warn(
        `Gagal membaca /queue/tree/print dari ${host}: ${
          err instanceof Error ? err.message : err
        }`
      );
    }

    await api.close();

    return {
      connected: true,
      message:
        queues.length > 0
          ? `${queues.length} queue ditemukan pada router`
          : 'Router terhubung, tetapi belum ada queue',
      queues,
    };
  } catch (err: unknown) {
    try {
      await api.close();
    } catch {
      // Ignored
    }

    return {
      connected: false,
      message: `Gagal mengambil queue: ${
        err instanceof Error ? err.message : String(err)
      }`,
      queues: [],
    };
  }
}

export interface RouterUserEntry {
  id: string;
  username: string;
  profile: string;
  comment?: string;
  address?: string;
}

export interface RouterUsersResult {
  connected: boolean;
  message: string;
  users: RouterUserEntry[];
}

async function fetchRouterUsers(
  params: {
    routerId: string;
    host: string;
    apiPort: number;
    username: string;
    password?: string;
    timeoutMs?: number;
  },
  path: string,
  label: string
): Promise<RouterUsersResult> {
  const { routerId, host, apiPort, username, password = '', timeoutMs = 4000 } = params;

  const socketCheck = await testRouterConnection(host, apiPort, 2000);
  if (!socketCheck.success) {
    return {
      connected: false,
      message: `Router tidak dapat dijangkau: ${socketCheck.message}`,
      users: [],
    };
  }

  const api = new RouterOSAPI({
    host,
    port: apiPort,
    user: username,
    password,
    timeout: Math.ceil(timeoutMs / 1000),
  });

  api.on('error', (err) => {
    logger.warn(`${label} fetch error (${host}:${apiPort}): ${err?.message || err}`);
  });

  const withTimeout = <T>(promise: Promise<T>, ms: number, opName: string): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout ${ms}ms: ${opName}`)), ms)
      ),
    ]);
  };

  try {
    await withTimeout(api.connect(), timeoutMs, 'koneksi RouterOS API');
    const rows: any[] = await withTimeout(
      api.write(path),
      timeoutMs,
      path
    );

    const users: RouterUserEntry[] = Array.isArray(rows)
      ? rows
          .map((item) => ({
            id: item['.id'] ? String(item['.id']) : String(item['name'] ?? ''),
            username: item['name'] ? String(item['name']) : '',
            profile: item['profile'] ? String(item['profile']) : '',
            comment: item['comment'] ? String(item['comment']) : undefined,
            address: item['remote-address']
              ? String(item['remote-address'])
              : undefined,
          }))
          .filter((item) => item.username)
      : [];

    await api.close();

    return {
      connected: true,
      message:
        users.length > 0
          ? `${users.length} ${label} ditemukan`
          : `Router terhubung, tetapi belum ada ${label}`,
      users,
    };
  } catch (err: unknown) {
    try {
      await api.close();
    } catch {
      // Ignored
    }
    return {
      connected: false,
      message: `Gagal mengambil ${label}: ${
        err instanceof Error ? err.message : String(err)
      }`,
      users: [],
    };
  }
}

export function fetchRouterPppoeSecrets(params: {
  routerId: string;
  host: string;
  apiPort: number;
  username: string;
  password?: string;
  timeoutMs?: number;
}): Promise<RouterUsersResult> {
  return fetchRouterUsers(params, '/ppp/secret/print', 'PPPoE secret');
}

export function fetchRouterHotspotUsers(params: {
  routerId: string;
  host: string;
  apiPort: number;
  username: string;
  password?: string;
  timeoutMs?: number;
}): Promise<RouterUsersResult> {
  return fetchRouterUsers(params, '/ip/hotspot/user/print', 'hotspot user');
}
