import { routerRepository, RouterRepository } from '../repositories/router.repository.js';
import {
  fetchRouterQueues,
  RouterQueuesResult,
  fetchRouterPppoeSecrets,
  fetchRouterHotspotUsers,
  RouterUsersResult,
} from '../core/routeros-client.js';
import { NotFoundError } from '../core/errors.js';
import { RouterEntity } from '../models/router.model.js';

const CACHE_TTL_MS = 15_000;

type CacheEntry<T> = {
  expiresAt: number;
  data: T;
};

export class RouterQueueService {
  private queueCache = new Map<string, CacheEntry<RouterQueuesResult>>();
  private pppoeCache = new Map<string, CacheEntry<RouterUsersResult>>();
  private hotspotCache = new Map<string, CacheEntry<RouterUsersResult>>();

  constructor(private routerRepo: RouterRepository = routerRepository) {}

  private async getRouter(routerId: string): Promise<RouterEntity> {
    const router = await this.routerRepo.findById(routerId);
    if (!router) {
      throw new NotFoundError(`Router dengan id ${routerId} tidak ditemukan`);
    }
    return router;
  }

  async getRouterQueues(routerId: string, refresh = false): Promise<RouterQueuesResult> {
    const cached = this.queueCache.get(routerId);
    if (!refresh && cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const router = await this.getRouter(routerId);
    const result = await fetchRouterQueues({
      routerId: router.id,
      host: router.host,
      apiPort: router.apiPort,
      username: router.username,
      password: router.password,
    });

    this.queueCache.set(routerId, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      data: result,
    });

    return result;
  }

  async getPppoeSecrets(routerId: string, refresh = false): Promise<RouterUsersResult> {
    const cached = this.pppoeCache.get(routerId);
    if (!refresh && cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const router = await this.getRouter(routerId);
    const result = await fetchRouterPppoeSecrets({
      routerId: router.id,
      host: router.host,
      apiPort: router.apiPort,
      username: router.username,
      password: router.password,
    });

    this.pppoeCache.set(routerId, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      data: result,
    });

    return result;
  }

  async getHotspotUsers(routerId: string, refresh = false): Promise<RouterUsersResult> {
    const cached = this.hotspotCache.get(routerId);
    if (!refresh && cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const router = await this.getRouter(routerId);
    const result = await fetchRouterHotspotUsers({
      routerId: router.id,
      host: router.host,
      apiPort: router.apiPort,
      username: router.username,
      password: router.password,
    });

    this.hotspotCache.set(routerId, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      data: result,
    });

    return result;
  }
}

export const routerQueueService = new RouterQueueService();
