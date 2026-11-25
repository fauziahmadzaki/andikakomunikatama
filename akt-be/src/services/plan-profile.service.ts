import { routerRepository, RouterRepository } from '../repositories/router.repository.js';
import {
  planProfileRepository,
  PlanProfileRepository,
} from '../repositories/plan-profile.repository.js';
import { BadRequestError, ConflictError, NotFoundError } from '../core/errors.js';
import { computeBandwidth, isValidIpv4, ipToNumber } from '../utils/bandwidth.js';
import {
  CreatePlanProfileInput,
  NewIpPoolInput,
} from '../validations/plan-profile.validation.js';
import { NewPlanProfileEntity } from '../models/plan-profile.model.js';
import { syncPlanProfileToRouter } from '../core/plan-profile-sync.js';

export class PlanProfileService {
  constructor(
    private planProfileRepo: PlanProfileRepository = planProfileRepository,
    private routerRepo: RouterRepository = routerRepository
  ) {}

  async getAllProfiles() {
    return this.planProfileRepo.findAllProfiles();
  }

  async getProfileById(id: string) {
    const profile = await this.planProfileRepo.findProfileById(id);
    if (!profile) {
      throw new NotFoundError(`Paket dengan id ${id} tidak ditemukan`);
    }
    return profile;
  }

  async getAllIpPools() {
    return this.planProfileRepo.findAllPools();
  }

  async createProfile(input: CreatePlanProfileInput) {
    const router = await this.ensureRouter(input.routerId);

    const ipPoolId = await this.resolveExistingPool(input);
    const poolToCreate = await this.prepareNewPool(input);

    const result = await this.planProfileRepo.createWithPool(
      this.buildProfilePayload(input, ipPoolId),
      poolToCreate
    );

    const pool = result.profile.ipPoolId
      ? await this.planProfileRepo.findPoolById(result.profile.ipPoolId)
      : undefined;

    const routerSync = await syncPlanProfileToRouter(
      router,
      result.profile,
      pool
    );

    return { ...result, routerSync };
  }

  async updateProfile(id: string, input: CreatePlanProfileInput) {
    const existing = await this.planProfileRepo.findProfileById(id);
    if (!existing) {
      throw new NotFoundError(`Paket dengan id ${id} tidak ditemukan`);
    }

    const router = await this.ensureRouter(input.routerId);
    const ipPoolId = await this.resolveExistingPool(input);
    const poolToCreate = await this.prepareNewPool(input);

    const result = await this.planProfileRepo.updateWithPool(
      id,
      this.buildProfilePayload(input, ipPoolId),
      poolToCreate
    );

    if (!result.profile) {
      throw new NotFoundError(`Paket dengan id ${id} tidak ditemukan`);
    }

    const pool = result.profile.ipPoolId
      ? await this.planProfileRepo.findPoolById(result.profile.ipPoolId)
      : undefined;

    const routerSync = await syncPlanProfileToRouter(
      router,
      result.profile,
      pool
    );

    return { ...result, routerSync };
  }

  async syncProfileToRouter(id: string) {
    const profile = await this.planProfileRepo.findProfileById(id);
    if (!profile) {
      throw new NotFoundError(`Paket dengan id ${id} tidak ditemukan`);
    }

    const router = await this.ensureRouter(profile.routerId);
    const pool = profile.ipPoolId
      ? await this.planProfileRepo.findPoolById(profile.ipPoolId)
      : undefined;

    return syncPlanProfileToRouter(router, profile, pool);
  }

  async toggleProfileStatus(id: string) {
    const existing = await this.planProfileRepo.findProfileById(id);
    if (!existing) {
      throw new NotFoundError(`Paket dengan id ${id} tidak ditemukan`);
    }

    const updated = await this.planProfileRepo.updateProfile(id, {
      isActive: !existing.isActive,
    });
    if (!updated) {
      throw new NotFoundError(`Paket dengan id ${id} tidak ditemukan`);
    }

    const router = await this.ensureRouter(updated.routerId);
    const pool = updated.ipPoolId
      ? await this.planProfileRepo.findPoolById(updated.ipPoolId)
      : undefined;
    const routerSync = await syncPlanProfileToRouter(router, updated, pool);

    return { profile: updated, routerSync };
  }

  async deleteProfile(id: string) {
    const deleted = await this.planProfileRepo.deleteProfile(id);
    if (!deleted) {
      throw new NotFoundError(`Paket dengan id ${id} tidak ditemukan`);
    }
    return { deleted: true };
  }

  private async ensureRouter(routerId: string) {
    const router = await this.routerRepo.findById(routerId);
    if (!router) {
      throw new NotFoundError(`Router dengan id ${routerId} tidak ditemukan`);
    }
    return router;
  }

  private async resolveExistingPool(
    input: CreatePlanProfileInput
  ): Promise<string | null> {
    if (input.newPool || !input.ipPoolId) {
      return null;
    }

    const pool = await this.planProfileRepo.findPoolById(input.ipPoolId);
    if (!pool) {
      throw new NotFoundError(`IP pool dengan id ${input.ipPoolId} tidak ditemukan`);
    }
    if (pool.routerId !== input.routerId) {
      throw new BadRequestError('IP pool tidak terdaftar pada router yang dipilih');
    }

    return pool.id;
  }

  private async prepareNewPool(input: CreatePlanProfileInput) {
    if (!input.newPool) {
      return undefined;
    }

    const pool: NewIpPoolInput = input.newPool;

    if (pool.routerId !== input.routerId) {
      throw new BadRequestError('Router IP pool harus sama dengan router paket');
    }

    if (!isValidIpv4(pool.rangeStart) || !isValidIpv4(pool.rangeEnd)) {
      throw new BadRequestError('Range IP pool tidak valid');
    }

    if (ipToNumber(pool.rangeStart) > ipToNumber(pool.rangeEnd)) {
      throw new BadRequestError('IP awal pool harus lebih kecil dari IP akhir');
    }

    const duplicate = await this.planProfileRepo.findPoolByRouterAndName(
      pool.routerId,
      pool.name
    );
    if (duplicate) {
      throw new ConflictError(
        `IP pool dengan nama ${pool.name.trim()} sudah ada pada router ini`
      );
    }

    return {
      routerId: pool.routerId,
      name: pool.name.trim(),
      rangeStart: pool.rangeStart.trim(),
      rangeEnd: pool.rangeEnd.trim(),
    };
  }

  private buildProfilePayload(
    input: CreatePlanProfileInput,
    ipPoolId: string | null
  ): NewPlanProfileEntity {
    const bandwidth = computeBandwidth({
      downloadMbps: input.downloadMbps,
      uploadMbps: input.uploadMbps,
      oversubscription: input.oversubscription,
      oversubRatio: input.oversubRatio,
    });

    return {
      name: input.name.trim(),
      description: input.description?.trim() ?? '',
      price: input.price,
      type: input.type,
      billingType: input.billingType,
      isActive: input.isActive,
      routerId: input.routerId,
      ipPoolId,
      parentQueueId: input.parentQueueId?.trim() ?? '',
      parentQueueName: input.parentQueueName?.trim() ?? '',
      localAddress: input.localAddress?.trim() ?? '',
      downloadMbps: input.downloadMbps,
      uploadMbps: input.uploadMbps,
      oversubscription: input.oversubscription,
      ...bandwidth,
    };
  }
}

export const planProfileService = new PlanProfileService();
