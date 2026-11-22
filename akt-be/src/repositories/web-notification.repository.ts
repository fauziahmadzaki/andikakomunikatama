import { eq, desc } from 'drizzle-orm';
import { db } from '../core/db.js';
import {
  webNotifications,
  WebNotificationEntity,
  NewWebNotificationEntity,
} from '../models/monitoring.model.js';

export class WebNotificationRepository {
  async findRecent(limit = 30): Promise<WebNotificationEntity[]> {
    return db
      .select()
      .from(webNotifications)
      .orderBy(desc(webNotifications.createdAt))
      .limit(limit);
  }

  async create(data: NewWebNotificationEntity): Promise<WebNotificationEntity> {
    const rows = await db.insert(webNotifications).values(data).returning();
    return rows[0];
  }

  async markAsRead(id: string): Promise<WebNotificationEntity | undefined> {
    const rows = await db
      .update(webNotifications)
      .set({ isRead: true })
      .where(eq(webNotifications.id, id))
      .returning();
    return rows[0];
  }

  async markAllAsRead(): Promise<number> {
    const rows = await db
      .update(webNotifications)
      .set({ isRead: true })
      .where(eq(webNotifications.isRead, false))
      .returning();
    return rows.length;
  }
}

export const webNotificationRepository = new WebNotificationRepository();
