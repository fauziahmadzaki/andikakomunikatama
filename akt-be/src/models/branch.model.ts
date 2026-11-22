import { pgTable, varchar, boolean, integer, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const branches = pgTable('branches', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull().default(''),
  address: varchar('address', { length: 500 }).notNull().default(''),
  isHeadOffice: boolean('is_head_office').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  customerCount: integer('customer_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type BranchEntity = typeof branches.$inferSelect;
export type NewBranchEntity = typeof branches.$inferInsert;
