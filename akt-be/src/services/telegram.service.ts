import { logger } from '../utils/logger.js';
import {
  MonitoringTargetEntity,
  MonitoringIncidentEntity,
  TelegramChannelEntity,
  NewTelegramChannelEntity,
} from '../models/monitoring.model.js';
import {
  telegramChannelRepository,
  TelegramChannelRepository,
} from '../repositories/telegram-channel.repository.js';
import { NotFoundError } from '../core/errors.js';

export interface SendTelegramResult {
  success: boolean;
  messageId?: number;
  description?: string;
}

export class TelegramService {
  constructor(
    private channelRepo: TelegramChannelRepository = telegramChannelRepository
  ) {}

  /**
   * Mengambil semua channel Telegram
   */
  async getAllChannels(): Promise<TelegramChannelEntity[]> {
    return this.channelRepo.findAll();
  }

  /**
   * Mengambil detail channel berdasarkan ID
   */
  async getChannelById(id: string): Promise<TelegramChannelEntity> {
    const channel = await this.channelRepo.findById(id);
    if (!channel) {
      throw new NotFoundError(`Channel Telegram dengan id ${id} tidak ditemukan`);
    }
    return channel;
  }

  /**
   * Tambah channel Telegram baru
   */
  async createChannel(
    data: Omit<NewTelegramChannelEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TelegramChannelEntity> {
    return this.channelRepo.create({
      name: data.name,
      botToken: data.botToken.trim(),
      chatId: data.chatId.trim(),
      threadId: data.threadId || null,
      notifyDown: data.notifyDown !== undefined ? data.notifyDown : true,
      notifyUp: data.notifyUp !== undefined ? data.notifyUp : true,
      isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
    });
  }

  /**
   * Update data channel Telegram
   */
  async updateChannel(
    id: string,
    data: Partial<Omit<NewTelegramChannelEntity, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<TelegramChannelEntity> {
    await this.getChannelById(id);
    const updated = await this.channelRepo.update(id, data);
    return updated!;
  }

  /**
   * Hapus channel Telegram
   */
  async deleteChannel(id: string): Promise<boolean> {
    await this.getChannelById(id);
    return this.channelRepo.delete(id);
  }

  /**
   * Mengirim pesan teks ke bot & chat Telegram tertentu
   */
  async sendToTelegram(
    botToken: string,
    chatId: string,
    text: string,
    threadId?: number | null
  ): Promise<SendTelegramResult> {
    if (!botToken || !chatId) {
      return { success: false, description: 'Bot Token dan Chat ID wajib diisi' };
    }

    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const body: Record<string, any> = {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      };
      if (threadId) {
        body.message_thread_id = threadId;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = (await res.json()) as {
        ok: boolean;
        result?: { message_id: number };
        description?: string;
      };

      if (!json.ok) {
        logger.warn(`Telegram API error: ${json.description}`);
        return { success: false, description: json.description || 'Gagal mengirim pesan Telegram' };
      }

      return { success: true, messageId: json.result?.message_id };
    } catch (err: any) {
      logger.error('Error saat request Telegram API:', err);
      return { success: false, description: err.message || 'Koneksi ke Telegram gagal' };
    }
  }

  /**
   * Test kirim pesan ke channel tertentu
   */
  async testChannel(id: string): Promise<SendTelegramResult> {
    const channel = await this.getChannelById(id);
    const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const text = `🔔 <b>[TEST NOTIFIKASI AKT MONITORING]</b>
━━━━━━━━━━━━━━━━━━━━
Channel: <b>${channel.name}</b>
Waktu: <code>${now} WIB</code>
Status: ✅ <b>Koneksi Bot Telegram Berhasil!</b>
━━━━━━━━━━━━━━━━━━━━
<i>Sistem SLA Monitoring siap mengirimkan alert real-time ke channel ini.</i>`;

    return this.sendToTelegram(channel.botToken, channel.chatId, text, channel.threadId);
  }

  /**
   * Alert ketika status host berganti menjadi DOWN
   * Mengirim ke semua channel aktif yang mengaktifkan notifyDown
   */
  async notifyDown(
    target: MonitoringTargetEntity,
    incident: MonitoringIncidentEntity,
    routerName?: string
  ): Promise<{ sentCount: number }> {
    const activeChannels = await this.channelRepo.findActive();
    const targetChannels = activeChannels.filter((c) => c.notifyDown);

    const timeStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const message = `🚨 <b>[ALERT] HOST DOWN DETECTED</b>
━━━━━━━━━━━━━━━━━━━━
📌 <b>Target:</b> ${target.name}
🌐 <b>IP/Host:</b> <code>${target.host}</code>
🏷 <b>Tipe:</b> ${target.type.toUpperCase()}
📡 <b>Router Monitor:</b> ${routerName || target.routerId}
⏰ <b>Waktu Kejadian:</b> ${timeStr} WIB
⚠️ <b>Status:</b> ❌ DOWN / Unreachable
━━━━━━━━━━━━━━━━━━━━
<i>Sistem monitoring otomatis mendeteksi kegagalan probe ICMP dari Netwatch.</i>`;

    let sentCount = 0;

    // 1. Kirim ke channel DB
    if (targetChannels.length > 0) {
      for (const channel of targetChannels) {
        const result = await this.sendToTelegram(
          channel.botToken,
          channel.chatId,
          message,
          channel.threadId
        );
        if (result.success) sentCount++;
      }
    } else {
      // 2. Fallback env token jika belum ada channel di DB
      const envToken = process.env.TELEGRAM_BOT_TOKEN;
      const envChat = process.env.TELEGRAM_CHAT_ID;
      if (envToken && envChat) {
        const result = await this.sendToTelegram(envToken, envChat, message);
        if (result.success) sentCount++;
      } else {
        logger.info(`[Telegram Alert Disimulasikan - Belum ada channel Telegram aktif]: \n${message}`);
      }
    }

    return { sentCount };
  }

  /**
   * Alert ketika host pulih kembali menjadi UP
   * Mengirim ke semua channel aktif yang mengaktifkan notifyUp
   */
  async notifyUp(
    target: MonitoringTargetEntity,
    incident?: MonitoringIncidentEntity | null,
    routerName?: string
  ): Promise<{ sentCount: number }> {
    const activeChannels = await this.channelRepo.findActive();
    const targetChannels = activeChannels.filter((c) => c.notifyUp);

    const timeStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const duration = incident?.durationSeconds
      ? this.formatDuration(incident.durationSeconds)
      : 'Beberapa detik';

    const message = `✅ <b>[RECOVERED] HOST NORMAL KEMBALI</b>
━━━━━━━━━━━━━━━━━━━━
📌 <b>Target:</b> ${target.name}
🌐 <b>IP/Host:</b> <code>${target.host}</code>
🏷 <b>Tipe:</b> ${target.type.toUpperCase()}
📡 <b>Router Monitor:</b> ${routerName || target.routerId}
⏰ <b>Waktu Pulih:</b> ${timeStr} WIB
⏱ <b>Total Downtime:</b> ${duration}
🟢 <b>Status:</b> ✅ UP / Normal
━━━━━━━━━━━━━━━━━━━━
<i>Host telah merespons probe Netwatch kembali secara normal.</i>`;

    let sentCount = 0;

    if (targetChannels.length > 0) {
      for (const channel of targetChannels) {
        const result = await this.sendToTelegram(
          channel.botToken,
          channel.chatId,
          message,
          channel.threadId
        );
        if (result.success) sentCount++;
      }
    } else {
      const envToken = process.env.TELEGRAM_BOT_TOKEN;
      const envChat = process.env.TELEGRAM_CHAT_ID;
      if (envToken && envChat) {
        const result = await this.sendToTelegram(envToken, envChat, message);
        if (result.success) sentCount++;
      } else {
        logger.info(`[Telegram Alert Disimulasikan - Belum ada channel Telegram aktif]: \n${message}`);
      }
    }

    return { sentCount };
  }

  private formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds} detik`;
    const minutes = Math.floor(seconds / 60);
    const remSeconds = seconds % 60;
    if (minutes < 60) return `${minutes} menit ${remSeconds} detik`;
    const hours = Math.floor(minutes / 60);
    const remMinutes = minutes % 60;
    return `${hours} jam ${remMinutes} menit`;
  }
}

export const telegramService = new TelegramService();
