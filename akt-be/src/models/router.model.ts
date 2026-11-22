import { pgTable, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const routers = pgTable('routers', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull(),
  branchId: varchar('branch_id', { length: 50 }).notNull().default('br-jkt'),
  host: varchar('host', { length: 255 }).notNull(),
  apiPort: integer('api_port').notNull().default(8728),
  username: varchar('username', { length: 100 }).notNull().default('admin'),
  password: varchar('password', { length: 255 }).notNull(), // Plaintext stored in DB as requested
  status: varchar('status', { length: 50 }).notNull().default('active'),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  lastTestResult: varchar('last_test_result', { length: 50 }), // 'success' | 'failed'
  lastTestMessage: varchar('last_test_message', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type RouterEntity = typeof routers.$inferSelect;
export type NewRouterEntity = typeof routers.$inferInsert;
