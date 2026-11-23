import { monitoringRepository, MonitoringRepository } from '../repositories/monitoring.repository.js';
import { routerRepository, RouterRepository } from '../repositories/router.repository.js';
import {
  MonitoringTargetEntity,
  MonitoringIncidentEntity,
} from '../models/monitoring.model.js';
import {
  syncNetwatchToRouter,
  removeNetwatchFromRouter,
  generateNetwatchCli,
  fetchPppoeClientsFromRouter,
} from '../core/netwatch-sync.js';
import { telegramService } from './telegram.service.js';
import { webNotificationService } from './web-notification.service.js';
import { NotFoundError } from '../core/errors.js';
import { logger } from '../utils/logger.js';

export interface UptimeBarItem {
  key: string;
  label: string; // e.g. "20 Nov 2026"
  date: string; // ISO date string
  status: 'up' | 'down' | 'mixed' | 'pending';
  uptimePercent: number;
  downtimeSeconds: number;
  incidentCount: number;
}

export interface TargetSlaSummary {
  target: MonitoringTargetEntity & {
    routerName: string;
    netwatchCli: string;
  };
  currentStatus: 'up' | 'down' | 'pending';
  uptimePercent: number; // e.g. 99.98
  totalDowntimeSeconds: number;
  lastIncident?: MonitoringIncidentEntity;
  bars: UptimeBarItem[]; // 33 bars sliding every 60s ala Uptime Kuma
  windowMinutes: number;
}

export class MonitoringService {
  constructor(
    private monitoringRepo: MonitoringRepository = monitoringRepository,
    private routerRepo: RouterRepository = routerRepository
  ) {}

  /**
   * Mengambil semua target monitoring beserta data bar Uptime Kuma (sliding 60 detik) & kalkulasi SLA akurat
   */
  async getAllTargetsWithSla(): Promise<TargetSlaSummary[]> {
    const [targets, routers] = await Promise.all([
      this.monitoringRepo.findAllTargets(),
      this.routerRepo.findAll(),
    ]);

    const routerMap = new Map(routers.map((r) => [r.id, r.name]));
    const now = new Date();
    const barsCount = 30; // 30 bars @ 60 detik = 30 menit sliding window ala Uptime Kuma
    const barIntervalSec = 60;
    const windowStart = new Date(now.getTime() - barsCount * barIntervalSec * 1000);

    const results: TargetSlaSummary[] = [];

    for (const target of targets) {
      const routerName = routerMap.get(target.routerId) || 'Unknown Router';
      const netwatchCli = generateNetwatchCli(target);

      // Ambil seluruh insiden yang menyentuh jendela waktu atau belum selesai
      const incidents = await this.monitoringRepo.findIncidentsInWindow(
        target.id,
        new Date(now.getTime() - 30 * 86400 * 1000), // Cari insiden hingga 30 hari ke belakang
        now
      );

      // Hitung SLA berbasis waktu aktif sejak target dibuat / dipantau (bukan asumsi 30 hari penuh)
      // "sla bukan dihitung 30 hari semua tapi last seen lalu di geser / nambah waktu setiap 60 detik"
      const createdMs = new Date(target.createdAt).getTime();
      const elapsedTrackedSec = Math.max(60, Math.floor((now.getTime() - createdMs) / 1000));
      const effectiveTrackedSec = Math.min(elapsedTrackedSec, 30 * 86400); // Maks 30 hari

      let totalDowntimeSec = 0;
      for (const inc of incidents) {
        const incStart = Math.max(createdMs, new Date(inc.startedAt).getTime());
        const incEnd = inc.resolvedAt ? new Date(inc.resolvedAt).getTime() : now.getTime();
        if (incEnd >= incStart) {
          totalDowntimeSec += Math.floor((incEnd - incStart) / 1000);
        }
      }

      // Hitung persentase SLA yang terus bertambah (recovery) setiap 60 detik saat host normal
      let uptimePercent = 100;
      if (totalDowntimeSec > 0) {
        uptimePercent = Math.max(
          0,
          Math.min(
            100,
            Math.round(((effectiveTrackedSec - totalDowntimeSec) / effectiveTrackedSec) * 10000) / 100
          )
        );
      }

      // Generate 33 capsule pills persis seperti Uptime Kuma (dari 33m lalu hingga 'now')
      // Setiap bar mewakili irisan waktu 60 detik
      const bars: UptimeBarItem[] = [];

      for (let i = 0; i < barsCount; i++) {
        // i = 0 -> 33m lalu, i = 32 -> now (menit saat ini)
        const minutesAgo = barsCount - i;
        const sliceStart = new Date(now.getTime() - minutesAgo * barIntervalSec * 1000);
        const sliceEnd = new Date(now.getTime() - (minutesAgo - 1) * barIntervalSec * 1000);

        let sliceDowntime = 0;
        let sliceIncidents = 0;

        for (const inc of incidents) {
          const incStart = new Date(inc.startedAt);
          const incEnd = inc.resolvedAt ? new Date(inc.resolvedAt) : now;

          if (incStart <= sliceEnd && incEnd >= sliceStart) {
            sliceIncidents++;
            const effectiveStart = Math.max(incStart.getTime(), sliceStart.getTime());
            const effectiveEnd = Math.min(incEnd.getTime(), sliceEnd.getTime());
            sliceDowntime += Math.max(0, Math.floor((effectiveEnd - effectiveStart) / 1000));
          }
        }

        // Tentukan status bar 60 detik ini
        let barStatus: 'up' | 'down' | 'mixed' | 'pending' = 'up';
        if (target.currentStatus === 'down' && i === barsCount - 1) {
          barStatus = 'down';
        } else if (sliceDowntime > 0) {
          barStatus = 'down';
        }

        const barUptime = Math.max(
          0,
          Math.min(100, Math.round(((barIntervalSec - sliceDowntime) / barIntervalSec) * 1000) / 10)
        );

        const timeLabel =
          i === barsCount - 1
            ? 'Sekarang'
            : `${minutesAgo}m lalu (${sliceStart.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })})`;

        bars.push({
          key: `min-${i}`,
          label: timeLabel,
          date: sliceStart.toISOString(),
          status: barStatus,
          uptimePercent: barUptime,
          downtimeSeconds: sliceDowntime,
          incidentCount: sliceIncidents,
        });
      }

      // Geser / nambah lastSeenAt setiap 60 detik jika target UP
      if (
        target.currentStatus === 'up' &&
        (!target.lastSeenAt || now.getTime() - new Date(target.lastSeenAt).getTime() >= 60000)
      ) {
        this.monitoringRepo.updateTarget(target.id, { lastSeenAt: now }).catch(() => {});
      }

      const lastIncident = incidents.sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      )[0];

      results.push({
        target: {
          ...target,
          routerName,
          netwatchCli,
        },
        currentStatus: target.currentStatus as 'up' | 'down' | 'pending',
        uptimePercent,
        totalDowntimeSeconds: totalDowntimeSec,
        lastIncident,
        bars,
        windowMinutes: barsCount,
      });
    }

    return results;
  }

  /**
   * Tambah target monitoring baru & otomatis sinkronkan ke Netwatch router
   */
  async createTarget(input: {
    name: string;
    host: string;
    routerId: string;
    intervalSeconds?: number;
    timeoutMs?: number;
    type?: string;
  }): Promise<{ target: MonitoringTargetEntity; netwatchSync: { success: boolean; message: string } }> {
    const router = await this.routerRepo.findById(input.routerId);
    if (!router) {
      throw new NotFoundError(`Router dengan id ${input.routerId} tidak ditemukan`);
    }

    const intervalSeconds = input.intervalSeconds || 10;
    const timeoutMs = input.timeoutMs || 1000;
    const type = input.type || 'gateway';

    const target = await this.monitoringRepo.createTarget({
      name: input.name,
      host: input.host,
      routerId: input.routerId,
      intervalSeconds,
      timeoutMs,
      type,
      currentStatus: 'pending',
      netwatchComment: `AKT-MON-${Date.now().toString(36)}`,
      netwatchSynced: false,
    });

    // Auto-sync to router Netwatch
    const syncResult = await syncNetwatchToRouter(router, target);
    if (syncResult.success) {
      await this.monitoringRepo.updateTarget(target.id, { netwatchSynced: true });
    }

    return {
      target: { ...target, netwatchSynced: syncResult.success },
      netwatchSync: syncResult,
    };
  }

  /**
   * Hapus target monitoring & bersihkan rule Netwatch di router
   */
  async deleteTarget(id: string): Promise<{ deleted: boolean; netwatchRemoved: boolean }> {
    const target = await this.monitoringRepo.findTargetById(id);
    if (!target) {
      throw new NotFoundError(`Target monitoring dengan id ${id} tidak ditemukan`);
    }

    let netwatchRemoved = false;
    if (target.netwatchComment) {
      const router = await this.routerRepo.findById(target.routerId);
      if (router) {
        const removeRes = await removeNetwatchFromRouter(router, target.netwatchComment);
        netwatchRemoved = removeRes.success;
      }
    }

    await this.monitoringRepo.deleteTarget(id);
    return { deleted: true, netwatchRemoved };
  }

  /**
   * Force sync Netwatch rule ke router
   */
  async syncTargetNetwatch(id: string): Promise<{ success: boolean; message: string }> {
    const target = await this.monitoringRepo.findTargetById(id);
    if (!target) {
      throw new NotFoundError(`Target monitoring dengan id ${id} tidak ditemukan`);
    }
    const router = await this.routerRepo.findById(target.routerId);
    if (!router) {
      throw new NotFoundError(`Router tidak ditemukan`);
    }

    const syncResult = await syncNetwatchToRouter(router, target);
    if (syncResult.success) {
      await this.monitoringRepo.updateTarget(target.id, { netwatchSynced: true });
    }
    return syncResult;
  }

  /**
   * State Machine Webhook: Dipanggil oleh Netwatch saat terjadi perubahan status
   * Sesuai request user:
   * - UP: simpan jika belum UP, jika sudah UP maka abaikan (skip).
   * - DOWN: simpan heartbeat DOWN dan buat Incident baru.
   */
  async handleWebhook(params: {
    targetId: string;
    status: 'up' | 'down';
    latencyMs?: number;
  }): Promise<{ acknowledged: boolean; message: string; action: string }> {
    const { targetId, status, latencyMs } = params;
    const target = await this.monitoringRepo.findTargetById(targetId);
    if (!target) {
      logger.warn(`Webhook diterima untuk targetId ${targetId} yang tidak ada di DB`);
      return { acknowledged: false, message: 'Target tidak ditemukan', action: 'none' };
    }

    const router = await this.routerRepo.findById(target.routerId);
    const routerName = router?.name || 'Router';
    const now = new Date();

    if (status === 'down') {
      // Transition to DOWN
      if (target.currentStatus !== 'down') {
        // 1. Catat heartbeat DOWN
        await this.monitoringRepo.createHeartbeat({
          targetId,
          status: 'down',
          latencyMs,
          recordedAt: now,
        });

        // 2. Buat ongoing incident baru
        const incident = await this.monitoringRepo.createIncident({
          targetId,
          startedAt: now,
          status: 'ongoing',
          cause: 'Netwatch ICMP probe timeout',
        });

        // 3. Update target state
        await this.monitoringRepo.updateTarget(targetId, {
          currentStatus: 'down',
          lastDownAt: now,
        });

        // 4. Alerting Telegram
        await telegramService.notifyDown(target, incident, routerName);

        // 5. Trigger Web Push Notification & SSE Event
        await webNotificationService.dispatchSlaAlert({
          target,
          incident,
          eventType: 'down',
          routerName,
        });

        logger.info(`🚨 [INCIDENT DOWN] Target ${target.name} (${target.host}) DOWN. Incident dibuat.`);
        return { acknowledged: true, message: 'Status DOWN tercatat, insiden dimulai', action: 'incident_created' };
      }

      // Sudah down sebelumnya: deduplikasi, tidak perlu duplikasi insiden
      return { acknowledged: true, message: 'Host sudah berstatus DOWN (deduplikasi)', action: 'skipped_duplicate' };
    }

    if (status === 'up') {
      // Transition to UP
      if (target.currentStatus !== 'up') {
        // 1. Catat heartbeat UP pemulihan
        await this.monitoringRepo.createHeartbeat({
          targetId,
          status: 'up',
          latencyMs,
          recordedAt: now,
        });

        // 2. Cari ongoing incident dan selesaikan
        const ongoing = await this.monitoringRepo.findOngoingIncident(targetId);
        let resolvedIncident: MonitoringIncidentEntity | undefined;

        if (ongoing) {
          const durationSec = Math.max(
            1,
            Math.floor((now.getTime() - new Date(ongoing.startedAt).getTime()) / 1000)
          );
          resolvedIncident = await this.monitoringRepo.resolveIncident(
            ongoing.id,
            now,
            durationSec
          );
        }

        // 3. Update target state
        await this.monitoringRepo.updateTarget(targetId, {
          currentStatus: 'up',
          lastSeenAt: now,
        });

        // 4. Alerting Telegram
        await telegramService.notifyUp(target, resolvedIncident, routerName);

        // 5. Trigger Web Push Notification & SSE Event
        await webNotificationService.dispatchSlaAlert({
          target,
          incident: resolvedIncident,
          eventType: 'up',
          routerName,
        });

        logger.info(`✅ [RECOVERED] Target ${target.name} (${target.host}) PULIH (UP). Insiden diselesaikan.`);
        return { acknowledged: true, message: 'Status UP tercatat, insiden diselesaikan', action: 'incident_resolved' };
      }

      // "lalu ada kejadian up yg baru maka g usah disimpan"
      // Update lastSeenAt saja secara ringan tanpa spamming tabel heartbeat
      await this.monitoringRepo.updateTarget(targetId, { lastSeenAt: now });
      return { acknowledged: true, message: 'Host sudah berstatus UP (heartbeat berulang diabaikan)', action: 'skipped_repeat_up' };
    }

    return { acknowledged: true, message: 'Status tidak dikenal', action: 'none' };
  }

  /**
   * Sinkronisasi massal seluruh akun PPPoE dari router menjadi target monitoring Netwatch
   * Jika data sudah ada -> di-skip
   */
  async syncPppoeToMonitoring(routerId?: string): Promise<{
    totalScanned: number;
    added: number;
    skipped: number;
    failed: number;
    items: { username: string; host: string; status: 'added' | 'skipped' | 'failed'; message?: string }[];
  }> {
    const routers = routerId
      ? [await this.routerRepo.findById(routerId)].filter(Boolean)
      : await this.routerRepo.findAll();

    const existingTargets = await this.monitoringRepo.findAllTargets();
    const existingHostMap = new Set(existingTargets.map((t) => t.host));
    const existingNameMap = new Set(existingTargets.map((t) => t.name.toLowerCase()));

    let totalScanned = 0;
    let added = 0;
    let skipped = 0;
    let failed = 0;
    const items: { username: string; host: string; status: 'added' | 'skipped' | 'failed'; message?: string }[] = [];

    const routerResults = await Promise.all(
      routers.map(async (r) => {
        if (!r) return { router: null, clients: [] };
        const clients = await fetchPppoeClientsFromRouter(r);
        return { router: r, clients };
      })
    );

    for (const { router: r, clients } of routerResults) {
      if (!r) continue;

      for (const client of clients) {
        totalScanned++;
        const secretName = client.username;
        const commentTrimmed = client.comment?.trim();
        const targetName = commentTrimmed
          ? `${secretName}-${commentTrimmed}`
          : `${'customer_pppoe'}-${secretName}`;

        // Cek apakah sudah ada target dengan IP atau nama yang sama
        if (existingHostMap.has(client.address) || existingNameMap.has(targetName.toLowerCase())) {
          skipped++;
          items.push({
            username: client.username,
            host: client.address,
            status: 'skipped',
            message: 'Target sudah terdaftar di monitoring SLA',
          });
          continue;
        }

        try {
          const created = await this.createTarget({
            name: targetName,
            host: client.address,
            routerId: r.id,
            intervalSeconds: 30,
            timeoutMs: 1000,
            type: 'customer_pppoe',
          });

          existingHostMap.add(client.address);
          existingNameMap.add(targetName.toLowerCase());
          added++;
          items.push({
            username: client.username,
            host: client.address,
            status: 'added',
            message: created.netwatchSync.message,
          });
        } catch (err) {
          failed++;
          items.push({
            username: client.username,
            host: client.address,
            status: 'failed',
            message: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    return { totalScanned, added, skipped, failed, items };
  }

  async getIncidentsByTarget(targetId: string, limit = 50): Promise<MonitoringIncidentEntity[]> {
    return this.monitoringRepo.findIncidentsByTarget(targetId, limit);
  }
}

export const monitoringService = new MonitoringService();
