import os from 'os';
import { RouterOSAPI } from 'node-routeros';
import { logger } from '../utils/logger.js';
import { testRouterConnection } from './router-connection.js';
import { RouterEntity } from '../models/router.model.js';
import { MonitoringTargetEntity } from '../models/monitoring.model.js';
import { env } from './config.js';

const withTimeout = <T>(promise: Promise<T>, ms: number, opName: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout ${ms}ms: ${opName}`)), ms)
    ),
  ]);
};

export function getServerIpForRouter(routerHost?: string): string {
  if (env.WEBHOOK_HOST) return env.WEBHOOK_HOST;

  const interfaces = os.networkInterfaces();
  const ips: string[] = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }

  // If router is on same subnet (e.g. 172.16.13.x), pick matching IP
  if (routerHost) {
    const routerSubnet = routerHost.split('.').slice(0, 3).join('.');
    const matched = ips.find((ip) => ip.startsWith(routerSubnet));
    if (matched) return matched;
  }

  // Filter out Hyper-V virtual switch / WSL subnets if possible
  const preferred = ips.find((ip) => !ip.startsWith('172.26.') && !ip.startsWith('172.23.'));
  return preferred || ips[0] || '127.0.0.1';
}

export function getWebhookUrl(targetId: string, status: 'up' | 'down', host?: string, port?: number): string {
  const targetHost = host || getServerIpForRouter();
  const targetPort = port || env.WEBHOOK_PORT || env.PORT || 5000;
  return `http://${targetHost}:${targetPort}/api/v1/monitoring/webhook?targetId=${targetId}&status=${status}`;
}

export function generateNetwatchCli(target: MonitoringTargetEntity, host?: string, port?: number): string {
  const upUrl = getWebhookUrl(target.id, 'up', host, port);
  const downUrl = getWebhookUrl(target.id, 'down', host, port);
  const comment = target.netwatchComment || `AKT-MON-${target.id.slice(0, 8)}`;
  const interval = `${target.intervalSeconds || 10}s`;
  const timeout = `${target.timeoutMs || 1000}ms`;

  return `/tool netwatch add host="${target.host}" interval=${interval} timeout=${timeout} comment="${comment}" up-script="/tool fetch url=\\"${upUrl}\\" keep-result=no" down-script="/tool fetch url=\\"${downUrl}\\" keep-result=no"`;
}

export async function syncNetwatchToRouter(
  router: RouterEntity,
  target: MonitoringTargetEntity,
  webhookHost?: string,
  webhookPort?: number
): Promise<{ success: boolean; message: string }> {
  // Pre-check socket
  const connCheck = await testRouterConnection(router.host, router.apiPort, 2000);
  if (!connCheck.success) {
    return {
      success: false,
      message: `Router ${router.name} offline: ${connCheck.message}`,
    };
  }

  const serverIp = webhookHost || getServerIpForRouter(router.host);
  const comment = target.netwatchComment || `AKT-MON-${target.id.slice(0, 8)}`;
  const upUrl = getWebhookUrl(target.id, 'up', serverIp, webhookPort);
  const downUrl = getWebhookUrl(target.id, 'down', serverIp, webhookPort);
  const interval = `${target.intervalSeconds || 10}s`;
  const timeout = `${target.timeoutMs || 1000}ms`;

  const api = new RouterOSAPI({
    host: router.host,
    port: router.apiPort,
    user: router.username,
    password: router.password,
    timeout: 3,
  });

  api.on('error', (err) => {
    logger.warn(`Netwatch sync error on ${router.host}:${router.apiPort}: ${err?.message || err}`);
  });

  try {
    await withTimeout(api.connect(), 2000, 'connect RouterOS');

    // If a netwatch entry for this host already exists, skip to avoid redundancy
    try {
      const list = await withTimeout(api.write('/tool/netwatch/print'), 1500, 'netwatch print');
      if (Array.isArray(list)) {
        const existingForHost = list.find((item) => item['host'] === target.host);
        if (existingForHost) {
          const existingUp = String(existingForHost['up-script'] ?? '');
          const existingDown = String(existingForHost['down-script'] ?? '');
          const expectedUp = `/tool fetch url="${upUrl}" keep-result=no`;
          const expectedDown = `/tool fetch url="${downUrl}" keep-result=no`;

          if (existingUp !== expectedUp || existingDown !== expectedDown) {
            await withTimeout(
              api.write('/tool/netwatch/set', [
                `=.id=${existingForHost['.id']}`,
                `=up-script=${expectedUp}`,
                `=down-script=${expectedDown}`,
              ]),
              1500,
              'netwatch set'
            );
            await api.close();
            return {
              success: true,
              message: `URL webhook Netwatch untuk ${target.host} diperbarui ke ${serverIp}`,
            };
          }

          await api.close();
          return {
            success: true,
            message: `Netwatch untuk host ${target.host} sudah ada di ${router.name}, dilewati (tidak ada duplikasi).`,
          };
        }
        // Clean up any existing rule with same comment from our system (legacy cleanup)
        for (const item of list) {
          if (item['.id'] && item['comment'] === comment) {
            await withTimeout(
              api.write('/tool/netwatch/remove', [`=.id=${item['.id']}`]),
              1500,
              'netwatch remove'
            );
          }
        }
      }
    } catch {
      // Ignored if print throws or has empty reply
    }

    // Add rule to MikroTik
    await withTimeout(
      api.write('/tool/netwatch/add', [
        `=host=${target.host}`,
        `=interval=${interval}`,
        `=timeout=${timeout}`,
        `=comment=${comment}`,
        `=up-script=/tool fetch url="${upUrl}" keep-result=no`,
        `=down-script=/tool fetch url="${downUrl}" keep-result=no`,
      ]),
      2000,
      'netwatch add'
    );

    await api.close();
    return {
      success: true,
      message: `Rule Netwatch berhasil dibuat di ${router.name} (${target.host})`,
    };
  } catch (err: unknown) {
    try {
      await api.close();
    } catch {}
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`Gagal sinkron Netwatch ke ${router.name}: ${msg}`);
    return {
      success: false,
      message: `Gagal sinkron ke router: ${msg}`,
    };
  }
}

export async function removeNetwatchFromRouter(
  router: RouterEntity,
  comment: string
): Promise<{ success: boolean; message: string }> {
  const connCheck = await testRouterConnection(router.host, router.apiPort, 2000);
  if (!connCheck.success) {
    return { success: false, message: `Router offline: ${connCheck.message}` };
  }

  const api = new RouterOSAPI({
    host: router.host,
    port: router.apiPort,
    user: router.username,
    password: router.password,
    timeout: 3,
  });

  api.on('error', (err) => {
    logger.warn(`Netwatch remove error on ${router.host}:${router.apiPort}: ${err?.message || err}`);
  });

  try {
    await withTimeout(api.connect(), 2000, 'connect RouterOS');
    const list = await withTimeout(api.write('/tool/netwatch/print'), 1500, 'netwatch print');
    if (Array.isArray(list)) {
      for (const item of list) {
        if (item['comment'] === comment && item['.id']) {
          await withTimeout(api.write('/tool/netwatch/remove', [`=.id=${item['.id']}`]), 1500, 'netwatch remove');
        }
      }
    }
    await api.close();
    return { success: true, message: 'Rule Netwatch dihapus dari router' };
  } catch (err: unknown) {
    try {
      await api.close();
    } catch {}
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Gagal menghapus rule dari router: ${msg}` };
  }
}

export interface RouterPppoeClient {
  username: string;
  address: string;
  callerId?: string;
  uptime?: string;
  comment?: string;
}

export async function fetchPppoeClientsFromRouter(router: RouterEntity): Promise<RouterPppoeClient[]> {
  const connCheck = await testRouterConnection(router.host, router.apiPort, 1000);
  if (!connCheck.success) {
    return [];
  }

  const api = new RouterOSAPI({
    host: router.host,
    port: router.apiPort,
    user: router.username,
    password: router.password,
    timeout: 3,
  });

  api.on('error', (err) => {
    logger.warn(`PPPoE fetch error on ${router.host}:${router.apiPort}: ${err?.message || err}`);
  });

  const clients: RouterPppoeClient[] = [];
  const secretMap = new Map<string, { address?: string; comment?: string }>();

  try {
    await withTimeout(api.connect(), 2000, 'connect RouterOS');

    // 1) Collect PPPoE secrets (name, remote-address, comment)
    try {
      const secrets = await withTimeout(
        api.write('/ppp/secret/print', ['?service=pppoe']),
        1500,
        'ppp secret print'
      );
      if (Array.isArray(secrets)) {
        for (const s of secrets) {
          const username = s['name'];
          if (!username || typeof username !== 'string') continue;
          const remoteAddress = s['remote-address'];
          const rawComment = s['comment'];
          const comment =
            typeof rawComment === 'string' && rawComment.trim().length > 0
              ? rawComment.trim()
              : undefined;
          secretMap.set(username, {
            address:
              remoteAddress && remoteAddress !== '0.0.0.0' ? String(remoteAddress) : undefined,
            comment,
          });
        }
      }
    } catch {}

    // 2) Active PPPoE sessions (prefer current address)
    try {
      const active = await withTimeout(
        api.write('/ppp/active/print', ['?service=pppoe']),
        1500,
        'ppp active print'
      );
      if (Array.isArray(active)) {
        for (const p of active) {
          if (p['name'] && p['address'] && p['address'] !== '0.0.0.0') {
            const username = String(p['name']);
            const secret = secretMap.get(username);
            clients.push({
              username,
              address: String(p['address']),
              callerId: p['caller-id'] ? String(p['caller-id']) : undefined,
              uptime: p['uptime'] ? String(p['uptime']) : undefined,
              comment: secret?.comment,
            });
            // Mark as handled by removing from consideration? We'll check by presence in clients.
            secretMap.delete(username);
          }
        }
      }
    } catch {}

    // 3) Add remaining secrets that were not active
    for (const [username, info] of secretMap.entries()) {
      if (info.address) {
        clients.push({
          username,
          address: info.address,
          comment: info.comment,
        });
      }
    }

    await api.close();
  } catch (err: unknown) {
    try {
      await api.close();
    } catch {}
    logger.warn(`Gagal mengambil data PPPoE dari router ${router.name}: ${err instanceof Error ? err.message : err}`);
  }

  return clients;
}
