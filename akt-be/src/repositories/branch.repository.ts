import { eq } from 'drizzle-orm';
import { db } from '../core/db.js';
import { branches, NewBranchEntity, BranchEntity } from '../models/branch.model.js';

export class BranchRepository {
  async findAll(): Promise<BranchEntity[]> {
    return db.select().from(branches).orderBy(branches.createdAt);
  }

  async findById(id: string): Promise<BranchEntity | undefined> {
    const result = await db.select().from(branches).where(eq(branches.id, id)).limit(1);
    return result[0];
  }

  async findByCode(code: string): Promise<BranchEntity | undefined> {
    const result = await db
      .select()
      .from(branches)
      .where(eq(branches.code, code.trim().toUpperCase()))
      .limit(1);
    return result[0];
  }

  async create(data: NewBranchEntity): Promise<BranchEntity> {
    const result = await db.insert(branches).values(data).returning();
    return result[0];
  }

  async update(id: string, data: Partial<NewBranchEntity>): Promise<BranchEntity | undefined> {
    const result = await db
      .update(branches)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(branches.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(branches).where(eq(branches.id, id)).returning();
    return result.length > 0;
  }
}

export const branchRepository = new BranchRepository();
