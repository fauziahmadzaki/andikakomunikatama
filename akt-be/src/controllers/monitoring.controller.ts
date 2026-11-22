import { Request, Response, NextFunction } from 'express';
import { monitoringService } from '../services/monitoring.service.js';
import { telegramService } from '../services/telegram.service.js';
import { webNotificationService } from '../services/web-notification.service.js';
import { sseManager } from '../core/sse-manager.js';
import { BadRequestError } from '../core/errors.js';

export class MonitoringController {
  async getAllTargets(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await monitoringService.getAllTargetsWithSla();
      res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  async createTarget(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, host, routerId, intervalSeconds, timeoutMs, type } = req.body;
      if (!name || !host || !routerId) {
        throw new BadRequestError('Nama target, host/IP, dan routerId wajib diisi');
      }

      const result = await monitoringService.createTarget({
        name,
        host,
        routerId,
        intervalSeconds: intervalSeconds ? Number(intervalSeconds) : 10,
        timeoutMs: timeoutMs ? Number(timeoutMs) : 1000,
        type: type || 'gateway',
      });

      res.status(201).json({
        success: true,
        message: 'Target monitoring berhasil ditambahkan',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteTarget(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await monitoringService.deleteTarget(id);
      res.json({
        success: true,
        message: 'Target monitoring berhasil dihapus',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async syncNetwatch(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await monitoringService.syncTargetNetwatch(id);
      res.json({
        success: result.success,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Webhook endpoint: Dipanggil otomatis oleh script Netwatch MikroTik
   * Mendukung baik query params (GET/POST) maupun JSON body (POST)
   */
  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      // Prioritaskan query params dari /tool fetch url="...?targetId=...&status=..."
      const targetId = (req.query.targetId as string) || req.body?.targetId;
      const rawStatus = (req.query.status as string) || req.body?.status;
      const latencyMs = req.query.latencyMs ? Number(req.query.latencyMs) : req.body?.latencyMs;

      if (!targetId || !rawStatus) {
        return res.status(400).json({
          success: false,
          message: 'Parameter targetId dan status wajib disertakan',
        });
      }

      const status = rawStatus.toLowerCase() === 'up' ? 'up' : 'down';
      const result = await monitoringService.handleWebhook({
        targetId,
        status,
        latencyMs,
      });

      res.json({
        success: result.acknowledged,
        message: result.message,
        action: result.action,
      });
    } catch (err) {
      next(err);
    }
  }

  async syncPppoe(req: Request, res: Response, next: NextFunction) {
    try {
      const routerId = req.body?.routerId;
      const result = await monitoringService.syncPppoeToMonitoring(routerId);
      res.json({
        success: true,
        message: `Sinkronisasi selesai: ${result.added} ditambahkan, ${result.skipped} dilewati, ${result.failed} gagal`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getTargetIncidents(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const incidents = await monitoringService.getIncidentsByTarget(id);
      res.json({
        success: true,
        data: incidents,
      });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // TELEGRAM CHANNELS CRUD & TEST
  // ==========================================

  async getTelegramChannels(req: Request, res: Response, next: NextFunction) {
    try {
      const channels = await telegramService.getAllChannels();
      res.json({
        success: true,
        data: channels,
      });
    } catch (err) {
      next(err);
    }
  }

  async createTelegramChannel(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, botToken, chatId, threadId, notifyDown, notifyUp, isEnabled } = req.body;
      if (!name || !botToken || !chatId) {
        throw new BadRequestError('Nama channel, Bot Token, dan Chat ID wajib diisi');
      }

      const channel = await telegramService.createChannel({
        name,
        botToken,
        chatId,
        threadId: threadId ? Number(threadId) : null,
        notifyDown: notifyDown !== undefined ? Boolean(notifyDown) : true,
        notifyUp: notifyUp !== undefined ? Boolean(notifyUp) : true,
        isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
      });

      res.status(201).json({
        success: true,
        message: 'Channel Telegram berhasil disimpan',
        data: channel,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateTelegramChannel(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { name, botToken, chatId, threadId, notifyDown, notifyUp, isEnabled } = req.body;

      const updated = await telegramService.updateChannel(id, {
        ...(name && { name }),
        ...(botToken && { botToken: botToken.trim() }),
        ...(chatId && { chatId: chatId.trim() }),
        ...(threadId !== undefined && { threadId: threadId ? Number(threadId) : null }),
        ...(notifyDown !== undefined && { notifyDown: Boolean(notifyDown) }),
        ...(notifyUp !== undefined && { notifyUp: Boolean(notifyUp) }),
        ...(isEnabled !== undefined && { isEnabled: Boolean(isEnabled) }),
      });

      res.json({
        success: true,
        message: 'Channel Telegram berhasil diperbarui',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteTelegramChannel(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await telegramService.deleteChannel(id);
      res.json({
        success: true,
        message: 'Channel Telegram berhasil dihapus',
      });
    } catch (err) {
      next(err);
    }
  }

  async testTelegramChannel(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await telegramService.testChannel(id);
      res.json({
        success: result.success,
        message: result.success
          ? 'Pesan test berhasil dikirim ke Telegram!'
          : `Gagal mengirim ke Telegram: ${result.description}`,
      });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // WEB NOTIFICATIONS & REALTIME SSE
  // ==========================================

  async getWebNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 30;
      const notifications = await webNotificationService.getRecentNotifications(limit);
      res.json({
        success: true,
        data: notifications,
      });
    } catch (err) {
      next(err);
    }
  }

  async markWebNotificationRead(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const updated = await webNotificationService.markAsRead(id);
      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  async markAllWebNotificationsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await webNotificationService.markAllAsRead();
      res.json({
        success: true,
        message: `${result.updatedCount} notifikasi ditandai sudah dibaca`,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * SSE Stream Endpoint: Browser client connect ke sini untuk menerima push notification real-time
   */
  subscribeEvents(req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering in Nginx

    const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    sseManager.addClient(clientId, res);

    req.on('close', () => {
      sseManager.removeClient(clientId);
    });
  }
}

export const monitoringController = new MonitoringController();
