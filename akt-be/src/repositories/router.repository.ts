import { eq } from 'drizzle-orm';
import { db } from '../core/db.js';
import { routers, NewRouterEntity, RouterEntity } from '../models/router.model.js';

export class RouterRepository {
  async findAll(): Promise<RouterEntity[]> {
    return db.select().from(routers).orderBy(routers.createdAt);
  }

  async findById(id: string): Promise<RouterEntity | undefined> {
    const result = await db.select().from(routers).where(eq(routers.id, id)).limit(1);
    return result[0];
  }

  async create(data: NewRouterEntity): Promise<RouterEntity> {
    const result = await db.insert(routers).values(data).returning();
    return result[0];
  }

  async update(id: string, data: Partial<NewRouterEntity>): Promise<RouterEntity | undefined> {
    const result = await db
      .update(routers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(routers.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(routers).where(eq(routers.id, id)).returning();
    return result.length > 0;
  }
}

export const routerRepository = new RouterRepository();
