import { RouterOSAPI } from 'node-routeros';
import { logger } from '../utils/logger.js';
import { testRouterConnection } from './router-connection.js';
import { RouterEntity } from '../models/router.model.js';
import {
  PlanProfileEntity,
  RouterIpPoolEntity,
} from '../models/plan-profile.model.js';

export interface RouterSyncResult {
  success: boolean;
  message: string;
}

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

function poolComment(pool: RouterIpPoolEntity) {
  return `AKT-POOL-${pool.id}`;
}

function profileComment(profile: PlanProfileEntity) {
  return `AKT-PLAN-${profile.id}`;
}

async function ensureIpPool(
  api: RouterOSAPI,
  pool: RouterIpPoolEntity
): Promise<string> {
  const pools: any[] = await withTimeout(
    api.write('/ip/pool/print'),
    2000,
    '/ip/pool/print'
  );

  const existing =
    (Array.isArray(pools)
      ? pools.find((item) => item['comment'] === poolComment(pool)) ??
        pools.find((item) => item['name'] === pool.name)
      : undefined) || undefined;

  const params = [
    `=name=${pool.name}`,
    `=ranges=${pool.rangeStart}-${pool.rangeEnd}`,
    `=comment=${poolComment(pool)}`,
  ];

  if (existing) {
    await withTimeout(
      api.write('/ip/pool/set', [`=.id=${existing['.id']}`, ...params]),
      2000,
      '/ip/pool/set'
    );
    return `IP pool ${pool.name} diperbarui`;
  }

  await withTimeout(
    api.write('/ip/pool/add', params),
    2000,
    '/ip/pool/add'
  );
  return `IP pool ${pool.name} ditambahkan`;
}

async function ensureProfile(
  api: RouterOSAPI,
  path: string,
  profile: PlanProfileEntity,
  pool?: RouterIpPoolEntity
): Promise<string> {
  const list: any[] = await withTimeout(
    api.write(`${path}/print`),
    2000,
    `${path}/print`
  );

  const existing =
    (Array.isArray(list)
      ? list.find((item) => item['comment'] === profileComment(profile)) ??
        list.find((item) => item['name'] === profile.name)
      : undefined) || undefined;

  const params = [
    `=name=${profile.name}`,
    `=rate-limit=${profile.rateLimit}`,
    `=comment=${profileComment(profile)}`,
  ];

  if (profile.type === 'pppoe' && profile.localAddress) {
    params.push(`=local-address=${profile.localAddress}`);
  }

  if (pool) {
    params.push(
      profile.type === 'pppoe'
        ? `=remote-address=${pool.name}`
        : `=address-pool=${pool.name}`
    );
  }

  if (existing) {
    await withTimeout(
      api.write(`${path}/set`, [`=.id=${existing['.id']}`, ...params]),
      2000,
      `${path}/set`
    );
    return `Profil paket ${profile.name} diperbarui`;
  }

  await withTimeout(
    api.write(`${path}/add`, params),
    2000,
    `${path}/add`
  );
  return `Profil paket ${profile.name} ditambahkan`;
}

export async function syncPlanProfileToRouter(
  router: RouterEntity,
  profile: PlanProfileEntity,
  pool?: RouterIpPoolEntity
): Promise<RouterSyncResult> {
  if (profile.type === 'other') {
    return {
      success: false,
      message:
        'Paket tipe "Lainnya" belum bisa disinkronkan otomatis. Gunakan PPPoE atau Hotspot.',
    };
  }

  const connCheck = await testRouterConnection(router.host, router.apiPort, 2000);
  if (!connCheck.success) {
    return {
      success: false,
      message: `Router ${router.name} offline: ${connCheck.message}`,
    };
  }

  const api = new RouterOSAPI({
    host: router.host,
    port: router.apiPort,
    user: router.username,
    password: router.password,
    timeout: 5,
  });

  api.on('error', (err) => {
    logger.warn(
      `Plan profile sync error on ${router.host}:${router.apiPort}: ${
        err?.message || err
      }`
    );
  });

  try {
    await withTimeout(api.connect(), 2000, 'connect RouterOS');

    const steps: string[] = [];

    if (pool) {
      steps.push(await ensureIpPool(api, pool));
    }

    const path =
      profile.type === 'pppoe'
        ? '/ppp/profile'
        : '/ip/hotspot/user/profile';

    steps.push(await ensureProfile(api, path, profile, pool));

    await api.close();

    return {
      success: true,
      message: `${steps.join('. ')} pada ${router.name}.`,
    };
  } catch (err: unknown) {
    try {
      await api.close();
    } catch {
      // Ignored
    }

    const message = err instanceof Error ? err.message : String(err);
    logger.warn(`Gagal sinkron paket ${profile.name} ke ${router.name}: ${message}`);

    return {
      success: false,
      message: `Gagal sinkron ke router: ${message}`,
    };
  }
}
