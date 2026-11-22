import { eq, desc } from 'drizzle-orm';
import { db } from '../core/db.js';
import {
  telegramChannels,
  TelegramChannelEntity,
  NewTelegramChannelEntity,
} from '../models/monitoring.model.js';

export class TelegramChannelRepository {
  async findAll(): Promise<TelegramChannelEntity[]> {
    return db.select().from(telegramChannels).orderBy(desc(telegramChannels.createdAt));
  }

  async findActive(): Promise<TelegramChannelEntity[]> {
    return db
      .select()
      .from(telegramChannels)
      .where(eq(telegramChannels.isEnabled, true))
      .orderBy(desc(telegramChannels.createdAt));
  }

  async findById(id: string): Promise<TelegramChannelEntity | undefined> {
    const rows = await db
      .select()
      .from(telegramChannels)
      .where(eq(telegramChannels.id, id))
      .limit(1);
    return rows[0];
  }

  async create(data: NewTelegramChannelEntity): Promise<TelegramChannelEntity> {
    const rows = await db.insert(telegramChannels).values(data).returning();
    return rows[0];
  }

  async update(
    id: string,
    data: Partial<NewTelegramChannelEntity>
  ): Promise<TelegramChannelEntity | undefined> {
    const rows = await db
      .update(telegramChannels)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(telegramChannels.id, id))
      .returning();
    return rows[0];
  }

  async delete(id: string): Promise<boolean> {
    const rows = await db
      .delete(telegramChannels)
      .where(eq(telegramChannels.id, id))
      .returning();
    return rows.length > 0;
  }
}

export const telegramChannelRepository = new TelegramChannelRepository();
