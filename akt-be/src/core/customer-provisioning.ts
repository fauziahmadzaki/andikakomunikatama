import { RouterOSAPI } from 'node-routeros';
import { logger } from '../utils/logger.js';
import { testRouterConnection } from './router-connection.js';
import { syncPlanProfileToRouter, RouterSyncResult } from './plan-profile-sync.js';
import { RouterEntity } from '../models/router.model.js';
import {
  PlanProfileEntity,
  RouterIpPoolEntity,
} from '../models/plan-profile.model.js';

const withTimeout = <T>(
  promise: Promise<T>,
  ms: number,
  opName: string
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout ${ms}ms: ${opName}`)), ms)
    ),
  ]);
};

async function ensurePppoeSecret(
  api: RouterOSAPI,
  input: {
    username: string;
    password: string;
    profileName: string;
    comment: string;
  }
): Promise<string> {
  const list: any[] = await withTimeout(
    api.write('/ppp/secret/print'),
    2000,
    '/ppp/secret/print'
  );
  const existing = Array.isArray(list)
    ? list.find((item) => item['name'] === input.username)
    : undefined;

  const params = [
    `=name=${input.username}`,
    `=password=${input.password}`,
    `=service=pppoe`,
    `=profile=${input.profileName}`,
    `=comment=${input.comment}`,
  ];

  if (existing) {
    await withTimeout(
      api.write('/ppp/secret/set', [`=.id=${existing['.id']}`, ...params]),
      2000,
      '/ppp/secret/set'
    );
    return `PPPoE secret ${input.username} diperbarui`;
  }

  await withTimeout(
    api.write('/ppp/secret/add', params),
    2000,
    '/ppp/secret/add'
  );
  return `PPPoE secret ${input.username} ditambahkan`;
}

async function ensureHotspotUser(
  api: RouterOSAPI,
  input: {
    username: string;
    password: string;
    profileName: string;
    comment: string;
  }
): Promise<string> {
  const list: any[] = await withTimeout(
    api.write('/ip/hotspot/user/print'),
    2000,
    '/ip/hotspot/user/print'
  );
  const existing = Array.isArray(list)
    ? list.find((item) => item['name'] === input.username)
    : undefined;

  const params = [
    `=name=${input.username}`,
    `=password=${input.password}`,
    `=profile=${input.profileName}`,
    `=comment=${input.comment}`,
  ];

  if (existing) {
    await withTimeout(
      api.write('/ip/hotspot/user/set', [`=.id=${existing['.id']}`, ...params]),
      2000,
      '/ip/hotspot/user/set'
    );
    return `Hotspot user ${input.username} diperbarui`;
  }

  await withTimeout(
    api.write('/ip/hotspot/user/add', params),
    2000,
    '/ip/hotspot/user/add'
  );
  return `Hotspot user ${input.username} ditambahkan`;
}

async function ensureSimpleQueue(
  api: RouterOSAPI,
  input: {
    name: string;
    targetIp: string;
    maxLimit: string;
    comment: string;
  }
): Promise<string> {
  const list: any[] = await withTimeout(
    api.write('/queue/simple/print'),
    2000,
    '/queue/simple/print'
  );
  const existing = Array.isArray(list)
    ? list.find((item) => item['name'] === input.name)
    : undefined;

  const params = [
    `=name=${input.name}`,
    `=target=${input.targetIp}/32`,
    `=max-limit=${input.maxLimit}`,
    `=comment=${input.comment}`,
  ];

  if (existing) {
    await withTimeout(
      api.write('/queue/simple/set', [`=.id=${existing['.id']}`, ...params]),
      2000,
      '/queue/simple/set'
    );
    return `Simple queue ${input.name} diperbarui`;
  }

  await withTimeout(
    api.write('/queue/simple/add', params),
    2000,
    '/queue/simple/add'
  );
  return `Simple queue ${input.name} ditambahkan`;
}

export async function provisionCustomerService(input: {
  router: RouterEntity;
  plan: PlanProfileEntity;
  pool?: RouterIpPoolEntity;
  connectionType: 'static' | 'dhcp' | 'pppoe' | 'hotspot';
  provisionMethod: 'new' | 'sync';
  username: string;
  password: string;
  customerNumber: string;
  customerName: string;
  queueName?: string;
  targetIp?: string;
}): Promise<RouterSyncResult> {
  if (input.provisionMethod === 'sync') {
    return {
      success: true,
      message: 'Data existing ditautkan tanpa membuat user baru di router.',
    };
  }

  if (input.connectionType === 'dhcp') {
    return {
      success: false,
      message: 'DHCP disimpan, provisioning queue menunggu IP pelanggan tersedia.',
    };
  }

  if (input.connectionType === 'static') {
    if (!input.targetIp) {
      return {
        success: false,
        message: 'IP target wajib diisi untuk provisioning static.',
      };
    }
  }

  const connCheck = await testRouterConnection(
    input.router.host,
    input.router.apiPort,
    2000
  );
  if (!connCheck.success) {
    return {
      success: false,
      message: `Router ${input.router.name} offline: ${connCheck.message}`,
    };
  }

  const api = new RouterOSAPI({
    host: input.router.host,
    port: input.router.apiPort,
    user: input.router.username,
    password: input.router.password,
    timeout: 5,
  });

  api.on('error', (err) => {
    logger.warn(
      `Customer provisioning error on ${input.router.host}:${input.router.apiPort}: ${
        err?.message || err
      }`
    );
  });

  try {
    await withTimeout(api.connect(), 2000, 'connect RouterOS');

    if (input.connectionType === 'pppoe' || input.connectionType === 'hotspot') {
      const planSync = await syncPlanProfileToRouter(
        input.router,
        input.plan,
        input.pool
      );
      if (!planSync.success) {
        await api.close();
        return planSync;
      }
    }

    let message = '';

    if (input.connectionType === 'pppoe') {
      message = await ensurePppoeSecret(api, {
        username: input.username,
        password: input.password,
        profileName: input.plan.name,
        comment: input.customerName,
      });
    } else if (input.connectionType === 'hotspot') {
      message = await ensureHotspotUser(api, {
        username: input.username,
        password: input.password,
        profileName: input.plan.name,
        comment: input.customerName,
      });
    } else if (input.connectionType === 'static') {
      const queueLabel = `${input.customerNumber}-${input.customerName}`;
      message = await ensureSimpleQueue(api, {
        name: input.queueName || queueLabel,
        targetIp: String(input.targetIp),
        maxLimit: `${input.plan.uploadMbps}M/${input.plan.downloadMbps}M`,
        comment: queueLabel,
      });
    }

    await api.close();

    return {
      success: true,
      message: `${message} pada ${input.router.name}.`,
    };
  } catch (err: unknown) {
    try {
      await api.close();
    } catch {
      // Ignored
    }

    const message = err instanceof Error ? err.message : String(err);
    logger.warn(
      `Gagal provisioning pelanggan ${input.username} ke ${input.router.name}: ${message}`
    );

    return {
      success: false,
      message: `Gagal provisioning ke router: ${message}`,
    };
  }
}
