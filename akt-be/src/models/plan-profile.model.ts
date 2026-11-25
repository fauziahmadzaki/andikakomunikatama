import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const routerIpPools = pgTable(
  'router_ip_pools',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    routerId: varchar('router_id', { length: 36 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    rangeStart: varchar('range_start', { length: 45 }).notNull(),
    rangeEnd: varchar('range_end', { length: 45 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    routerNameUnique: unique('router_ip_pools_router_name_unique').on(
      table.routerId,
      table.name
    ),
    routerIdx: index('router_ip_pools_router_id_idx').on(table.routerId),
  })
);

export const planProfiles = pgTable(
  'plan_profiles',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description').notNull().default(''),
    price: integer('price').notNull().default(0),
    type: varchar('type', { length: 20 }).notNull().default('pppoe'),
    billingType: varchar('billing_type', { length: 20 }).notNull().default('monthly'),
    isActive: boolean('is_active').notNull().default(true),
    routerId: varchar('router_id', { length: 36 }).notNull(),
    ipPoolId: varchar('ip_pool_id', { length: 36 }).references(() => routerIpPools.id, {
      onDelete: 'set null',
    }),
    parentQueueId: varchar('parent_queue_id', { length: 100 }).notNull().default(''),
    parentQueueName: varchar('parent_queue_name', { length: 255 }).notNull().default(''),
    localAddress: varchar('local_address', { length: 45 }).notNull().default(''),
    downloadMbps: doublePrecision('download_mbps').notNull().default(0),
    uploadMbps: doublePrecision('upload_mbps').notNull().default(0),
    oversubscription: boolean('oversubscription').notNull().default(true),
    oversubRatio: doublePrecision('oversub_ratio').notNull().default(1),
    cirDownloadMbps: doublePrecision('cir_download_mbps').notNull().default(0),
    cirUploadMbps: doublePrecision('cir_upload_mbps').notNull().default(0),
    mirDownloadMbps: doublePrecision('mir_download_mbps').notNull().default(0),
    mirUploadMbps: doublePrecision('mir_upload_mbps').notNull().default(0),
    burstDownloadMbps: doublePrecision('burst_download_mbps').notNull().default(0),
    burstUploadMbps: doublePrecision('burst_upload_mbps').notNull().default(0),
    rateLimit: varchar('rate_limit', { length: 255 }).notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    routerIdx: index('plan_profiles_router_id_idx').on(table.routerId),
    ipPoolIdx: index('plan_profiles_ip_pool_id_idx').on(table.ipPoolId),
  })
);

export type RouterIpPoolEntity = typeof routerIpPools.$inferSelect;
export type NewRouterIpPoolEntity = typeof routerIpPools.$inferInsert;
export type PlanProfileEntity = typeof planProfiles.$inferSelect;
export type NewPlanProfileEntity = typeof planProfiles.$inferInsert;
