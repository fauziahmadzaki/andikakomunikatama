import { Response } from 'express';
import { logger } from '../utils/logger.js';

export interface SseClient {
  id: string;
  res: Response;
}

export class SseManager {
  private clients: Map<string, Response> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Send a periodic heartbeat ping every 25 seconds to keep connections alive through reverse proxies
    this.pingInterval = setInterval(() => {
      this.broadcastRaw(': ping\n\n');
    }, 25000);
  }

  /**
   * Mendaftarkan client SSE baru
   */
  addClient(id: string, res: Response): void {
    this.clients.set(id, res);
    logger.info(`[SSE] Client tersambung: ${id} (Total aktif: ${this.clients.size})`);

    // Kirim pesan salam / status inisialisasi
    this.sendToClient(res, 'connected', {
      status: 'connected',
      clientId: id,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Menghapus client yang terputus
   */
  removeClient(id: string): void {
    if (this.clients.has(id)) {
      this.clients.delete(id);
      logger.info(`[SSE] Client terputus: ${id} (Sisa aktif: ${this.clients.size})`);
    }
  }

  /**
   * Mengirim event ke satu client tertentu
   */
  private sendToClient(res: Response, event: string, data: any): void {
    try {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      logger.warn(`[SSE] Gagal mengirim data ke client:`, err);
    }
  }

  /**
   * Broadcast raw string ke semua client
   */
  private broadcastRaw(raw: string): void {
    for (const [id, res] of this.clients.entries()) {
      try {
        res.write(raw);
      } catch (err) {
        this.removeClient(id);
      }
    }
  }

  /**
   * Broadcast structured event ke seluruh browser yang sedang aktif
   */
  broadcast(event: string, data: any): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const [id, res] of this.clients.entries()) {
      try {
        res.write(payload);
      } catch (err) {
        this.removeClient(id);
      }
    }
    logger.info(`[SSE Broadcast] Event '${event}' dikirim ke ${this.clients.size} client aktif.`);
  }

  /**
   * Jumlah client aktif
   */
  getClientCount(): number {
    return this.clients.size;
  }
}

export const sseManager = new SseManager();
