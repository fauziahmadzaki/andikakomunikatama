import { eq, desc, and, gte, lte, or, isNull } from 'drizzle-orm';
import { db } from '../core/db.js';
import {
  monitoringTargets,
  monitoringIncidents,
  monitoringHeartbeats,
  MonitoringTargetEntity,
  NewMonitoringTargetEntity,
  MonitoringIncidentEntity,
  NewMonitoringIncidentEntity,
  MonitoringHeartbeatEntity,
  NewMonitoringHeartbeatEntity,
} from '../models/monitoring.model.js';

export class MonitoringRepository {
  async findAllTargets(): Promise<MonitoringTargetEntity[]> {
    return db.select().from(monitoringTargets).orderBy(desc(monitoringTargets.createdAt));
  }

  async findTargetById(id: string): Promise<MonitoringTargetEntity | undefined> {
    const rows = await db
      .select()
      .from(monitoringTargets)
      .where(eq(monitoringTargets.id, id))
      .limit(1);
    return rows[0];
  }

  async findTargetByHost(host: string): Promise<MonitoringTargetEntity | undefined> {
    const rows = await db
      .select()
      .from(monitoringTargets)
      .where(eq(monitoringTargets.host, host))
      .limit(1);
    return rows[0];
  }

  async createTarget(data: NewMonitoringTargetEntity): Promise<MonitoringTargetEntity> {
    const rows = await db.insert(monitoringTargets).values(data).returning();
    return rows[0];
  }

  async updateTarget(
    id: string,
    data: Partial<NewMonitoringTargetEntity>
  ): Promise<MonitoringTargetEntity | undefined> {
    const rows = await db
      .update(monitoringTargets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(monitoringTargets.id, id))
      .returning();
    return rows[0];
  }

  async deleteTarget(id: string): Promise<boolean> {
    const rows = await db
      .delete(monitoringTargets)
      .where(eq(monitoringTargets.id, id))
      .returning();
    return rows.length > 0;
  }

  // Incidents
  async findOngoingIncident(targetId: string): Promise<MonitoringIncidentEntity | undefined> {
    const rows = await db
      .select()
      .from(monitoringIncidents)
      .where(
        and(
          eq(monitoringIncidents.targetId, targetId),
          eq(monitoringIncidents.status, 'ongoing')
        )
      )
      .orderBy(desc(monitoringIncidents.startedAt))
      .limit(1);
    return rows[0];
  }

  async createIncident(data: NewMonitoringIncidentEntity): Promise<MonitoringIncidentEntity> {
    const rows = await db.insert(monitoringIncidents).values(data).returning();
    return rows[0];
  }

  async resolveIncident(
    id: string,
    resolvedAt: Date,
    durationSeconds: number
  ): Promise<MonitoringIncidentEntity | undefined> {
    const rows = await db
      .update(monitoringIncidents)
      .set({
        resolvedAt,
        durationSeconds,
        status: 'resolved',
      })
      .where(eq(monitoringIncidents.id, id))
      .returning();
    return rows[0];
  }

  async findIncidentsByTarget(targetId: string, limit = 20): Promise<MonitoringIncidentEntity[]> {
    return db
      .select()
      .from(monitoringIncidents)
      .where(eq(monitoringIncidents.targetId, targetId))
      .orderBy(desc(monitoringIncidents.startedAt))
      .limit(limit);
  }

  async findIncidentsInWindow(
    targetId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<MonitoringIncidentEntity[]> {
    return db
      .select()
      .from(monitoringIncidents)
      .where(
        and(
          eq(monitoringIncidents.targetId, targetId),
          or(
            // Started inside window
            and(
              gte(monitoringIncidents.startedAt, fromDate),
              lte(monitoringIncidents.startedAt, toDate)
            ),
            // Or ongoing and started before window
            and(
              lte(monitoringIncidents.startedAt, toDate),
              or(
                isNull(monitoringIncidents.resolvedAt),
                gte(monitoringIncidents.resolvedAt, fromDate)
              )
            )
          )
        )
      );
  }

  // Heartbeats
  async createHeartbeat(data: NewMonitoringHeartbeatEntity): Promise<MonitoringHeartbeatEntity> {
    const rows = await db.insert(monitoringHeartbeats).values(data).returning();
    return rows[0];
  }

  async findRecentHeartbeats(targetId: string, limit = 10): Promise<MonitoringHeartbeatEntity[]> {
    return db
      .select()
      .from(monitoringHeartbeats)
      .where(eq(monitoringHeartbeats.targetId, targetId))
      .orderBy(desc(monitoringHeartbeats.recordedAt))
      .limit(limit);
  }
}

export const monitoringRepository = new MonitoringRepository();
