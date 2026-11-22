import { pgTable, varchar, integer, timestamp, boolean, text, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const monitoringTargets = pgTable('monitoring_targets', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull(),
  host: varchar('host', { length: 255 }).notNull(),
  routerId: varchar('router_id', { length: 36 }).notNull(),
  intervalSeconds: integer('interval_seconds').notNull().default(10),
  timeoutMs: integer('timeout_ms').notNull().default(1000),
  type: varchar('type', { length: 50 }).notNull().default('gateway'), // gateway, olt, switch, server, customer_pppoe, other
  currentStatus: varchar('current_status', { length: 20 }).notNull().default('pending'), // up, down, pending
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  lastDownAt: timestamp('last_down_at', { withTimezone: true }),
  netwatchComment: varchar('netwatch_comment', { length: 255 }),
  netwatchSynced: boolean('netwatch_synced').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const monitoringIncidents = pgTable('monitoring_incidents', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  targetId: varchar('target_id', { length: 36 }).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  durationSeconds: integer('duration_seconds'),
  status: varchar('status', { length: 20 }).notNull().default('ongoing'), // ongoing, resolved
  cause: text('cause').default('Netwatch probe unreachable'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const monitoringHeartbeats = pgTable('monitoring_heartbeats', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  targetId: varchar('target_id', { length: 36 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(), // up, down
  latencyMs: integer('latency_ms'),
  metadata: jsonb('metadata'),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull().defaultNow(),
});

export const telegramChannels = pgTable('telegram_channels', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull(),
  botToken: text('bot_token').notNull(),
  chatId: varchar('chat_id', { length: 100 }).notNull(),
  threadId: integer('thread_id'),
  notifyDown: boolean('notify_down').notNull().default(true),
  notifyUp: boolean('notify_up').notNull().default(true),
  isEnabled: boolean('is_enabled').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const webNotifications = pgTable('web_notifications', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  targetId: varchar('target_id', { length: 36 }),
  type: varchar('type', { length: 50 }).notNull().default('sla_down'), // sla_down, sla_up, system
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type MonitoringTargetEntity = typeof monitoringTargets.$inferSelect;
export type NewMonitoringTargetEntity = typeof monitoringTargets.$inferInsert;

export type MonitoringIncidentEntity = typeof monitoringIncidents.$inferSelect;
export type NewMonitoringIncidentEntity = typeof monitoringIncidents.$inferInsert;

export type MonitoringHeartbeatEntity = typeof monitoringHeartbeats.$inferSelect;
export type NewMonitoringHeartbeatEntity = typeof monitoringHeartbeats.$inferInsert;

export type TelegramChannelEntity = typeof telegramChannels.$inferSelect;
export type NewTelegramChannelEntity = typeof telegramChannels.$inferInsert;

export type WebNotificationEntity = typeof webNotifications.$inferSelect;
export type NewWebNotificationEntity = typeof webNotifications.$inferInsert;
