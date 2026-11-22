import {
  webNotificationRepository,
  WebNotificationRepository,
} from '../repositories/web-notification.repository.js';
import {
  WebNotificationEntity,
  MonitoringTargetEntity,
  MonitoringIncidentEntity,
} from '../models/monitoring.model.js';
import { sseManager } from '../core/sse-manager.js';
import { logger } from '../utils/logger.js';

export class WebNotificationService {
  constructor(
    private notifRepo: WebNotificationRepository = webNotificationRepository
  ) {}

  async getRecentNotifications(limit = 30): Promise<WebNotificationEntity[]> {
    return this.notifRepo.findRecent(limit);
  }

  async markAsRead(id: string): Promise<WebNotificationEntity | undefined> {
    return this.notifRepo.markAsRead(id);
  }

  async markAllAsRead(): Promise<{ updatedCount: number }> {
    const updatedCount = await this.notifRepo.markAllAsRead();
    return { updatedCount };
  }

  /**
   * Memicu Push Notification ke browser via SSE dan menyimpan ke database
   */
  async dispatchSlaAlert(params: {
    target: MonitoringTargetEntity;
    incident?: MonitoringIncidentEntity | null;
    eventType: 'down' | 'up';
    routerName?: string;
  }): Promise<WebNotificationEntity> {
    const { target, incident, eventType, routerName } = params;
    const timeStr = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const isDown = eventType === 'down';
    const title = isDown
      ? `🚨 SLA DOWN: ${target.name}`
      : `🟢 SLA RECOVERY: ${target.name}`;

    const message = isDown
      ? `Host ${target.name} (${target.host}) terdeteksi DOWN di router ${routerName || target.routerId} pada ${timeStr} WIB.`
      : `Host ${target.name} (${target.host}) telah PULIH kembali normal pada ${timeStr} WIB.`;

    // 1. Simpan ke database
    const savedNotif = await this.notifRepo.create({
      targetId: target.id,
      type: isDown ? 'sla_down' : 'sla_up',
      title,
      message,
      isRead: false,
    });

    // 2. Broadcast via SSE ke semua browser web yang sedang online
    sseManager.broadcast('sla_alert', {
      id: savedNotif.id,
      targetId: target.id,
      targetName: target.name,
      targetHost: target.host,
      eventType,
      title,
      message,
      routerName,
      timestamp: savedNotif.createdAt,
    });

    logger.info(`[Web Notification] Dispatched alert '${title}' via SSE.`);
    return savedNotif;
  }
}

export const webNotificationService = new WebNotificationService();
