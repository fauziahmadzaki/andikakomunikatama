import { and, eq } from 'drizzle-orm';
import { db } from '../core/db.js';
import {
  planProfiles,
  routerIpPools,
  NewPlanProfileEntity,
  NewRouterIpPoolEntity,
  PlanProfileEntity,
  RouterIpPoolEntity,
} from '../models/plan-profile.model.js';

export class PlanProfileRepository {
  async findAllProfiles(): Promise<PlanProfileEntity[]> {
    return db.select().from(planProfiles).orderBy(planProfiles.createdAt);
  }

  async findProfileById(id: string): Promise<PlanProfileEntity | undefined> {
    const result = await db
      .select()
      .from(planProfiles)
      .where(eq(planProfiles.id, id))
      .limit(1);
    return result[0];
  }

  async findAllPools(): Promise<RouterIpPoolEntity[]> {
    return db.select().from(routerIpPools).orderBy(routerIpPools.createdAt);
  }

  async findPoolById(id: string): Promise<RouterIpPoolEntity | undefined> {
    const result = await db
      .select()
      .from(routerIpPools)
      .where(eq(routerIpPools.id, id))
      .limit(1);
    return result[0];
  }

  async findPoolByRouterAndName(
    routerId: string,
    name: string
  ): Promise<RouterIpPoolEntity | undefined> {
    const result = await db
      .select()
      .from(routerIpPools)
      .where(
        and(
          eq(routerIpPools.routerId, routerId),
          eq(routerIpPools.name, name.trim())
        )
      )
      .limit(1);
    return result[0];
  }

  async createPool(data: NewRouterIpPoolEntity): Promise<RouterIpPoolEntity> {
    const result = await db.insert(routerIpPools).values(data).returning();
    return result[0];
  }

  async createProfile(
    data: NewPlanProfileEntity
  ): Promise<PlanProfileEntity> {
    const result = await db.insert(planProfiles).values(data).returning();
    return result[0];
  }

  async updateProfile(
    id: string,
    data: Partial<NewPlanProfileEntity>
  ): Promise<PlanProfileEntity | undefined> {
    const result = await db
      .update(planProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(planProfiles.id, id))
      .returning();
    return result[0];
  }

  async deleteProfile(id: string): Promise<boolean> {
    const result = await db
      .delete(planProfiles)
      .where(eq(planProfiles.id, id))
      .returning();
    return result.length > 0;
  }

  async createWithPool(
    profile: NewPlanProfileEntity,
    pool?: NewRouterIpPoolEntity
  ): Promise<{ profile: PlanProfileEntity; pool?: RouterIpPoolEntity }> {
    return db.transaction(async (tx) => {
      let createdPool: RouterIpPoolEntity | undefined;

      if (pool) {
        const poolResult = await tx.insert(routerIpPools).values(pool).returning();
        createdPool = poolResult[0];
      }

      const profileResult = await tx
        .insert(planProfiles)
        .values({
          ...profile,
          ipPoolId: createdPool?.id ?? profile.ipPoolId,
        })
        .returning();

      return { profile: profileResult[0], pool: createdPool };
    });
  }

  async updateWithPool(
    id: string,
    patch: Partial<NewPlanProfileEntity>,
    pool?: NewRouterIpPoolEntity
  ): Promise<{ profile?: PlanProfileEntity; pool?: RouterIpPoolEntity }> {
    return db.transaction(async (tx) => {
      let createdPool: RouterIpPoolEntity | undefined;

      if (pool) {
        const poolResult = await tx.insert(routerIpPools).values(pool).returning();
        createdPool = poolResult[0];
      }

      const result = await tx
        .update(planProfiles)
        .set({
          ...patch,
          ...(createdPool ? { ipPoolId: createdPool.id } : {}),
          updatedAt: new Date(),
        })
        .where(eq(planProfiles.id, id))
        .returning();

      return { profile: result[0], pool: createdPool };
    });
  }
}

export const planProfileRepository = new PlanProfileRepository();
