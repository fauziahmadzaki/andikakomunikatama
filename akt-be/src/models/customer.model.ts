import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const customers = pgTable(
  'customers',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    branchId: varchar('branch_id', { length: 36 }).notNull(),
    salesEmployeeId: varchar('sales_employee_id', { length: 36 }),
    customerNumber: varchar('customer_number', { length: 20 }).notNull().unique(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    customerType: varchar('customer_type', { length: 20 }).notNull().default('residential'),
    registrationType: varchar('registration_type', { length: 20 }).notNull().default('new'),
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    registeredAt: date('registered_at').notNull().defaultNow(),
    notes: text('notes').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    branchIdx: index('customers_branch_id_idx').on(table.branchId),
    statusIdx: index('customers_status_idx').on(table.status),
  })
);

export const customerAddresses = pgTable(
  'customer_addresses',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    customerId: varchar('customer_id', { length: 36 })
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' }),
    addressType: varchar('address_type', { length: 20 }).notNull().default('home'),
    addressLine: varchar('address_line', { length: 500 }).notNull().default(''),
    village: varchar('village', { length: 150 }).notNull().default(''),
    villageId: varchar('village_id', { length: 50 }),
    district: varchar('district', { length: 150 }).notNull().default(''),
    districtId: varchar('district_id', { length: 50 }),
    city: varchar('city', { length: 150 }).notNull().default(''),
    regencyId: varchar('regency_id', { length: 50 }),
    province: varchar('province', { length: 150 }).notNull().default(''),
    provinceId: varchar('province_id', { length: 50 }),
    postalCode: varchar('postal_code', { length: 20 }).notNull().default(''),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    isPrimary: boolean('is_primary').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    customerIdx: index('customer_addresses_customer_id_idx').on(table.customerId),
  })
);

export const customerContacts = pgTable(
  'customer_contacts',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    customerId: varchar('customer_id', { length: 36 })
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' }),
    contactType: varchar('contact_type', { length: 20 }).notNull().default('phone'),
    value: varchar('value', { length: 255 }).notNull(),
    isPrimary: boolean('is_primary').notNull().default(false),
    isVerified: boolean('is_verified').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    customerIdx: index('customer_contacts_customer_id_idx').on(table.customerId),
  })
);

export const customerIdentities = pgTable(
  'customer_identities',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    customerId: varchar('customer_id', { length: 36 })
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' }),
    identityType: varchar('identity_type', { length: 20 }).notNull().default('ktp'),
    identityNumber: varchar('identity_number', { length: 100 }).notNull(),
    fileId: varchar('file_id', { length: 255 }),
    fileName: varchar('file_name', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    customerIdx: index('customer_identities_customer_id_idx').on(table.customerId),
  })
);

export const customerAccounts = pgTable(
  'customer_accounts',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    customerId: varchar('customer_id', { length: 36 })
      .notNull()
      .unique()
      .references(() => customers.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull().default(''),
    phone: varchar('phone', { length: 50 }).notNull().default(''),
    isActive: boolean('is_active').notNull().default(true),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  }
);

export const customerStatusHistory = pgTable(
  'customer_status_history',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    customerId: varchar('customer_id', { length: 36 })
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 }).notNull(),
    reason: text('reason').notNull().default(''),
    changedBy: varchar('changed_by', { length: 255 }).notNull().default('System'),
    changedAt: timestamp('changed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    customerIdx: index('customer_status_history_customer_id_idx').on(table.customerId),
  })
);

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    number: varchar('number', { length: 50 }).notNull().unique(),
    customerId: varchar('customer_id', { length: 36 })
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' }),
    planId: varchar('plan_id', { length: 36 }).notNull(),
    branchId: varchar('branch_id', { length: 36 }).notNull(),
    discountId: varchar('discount_id', { length: 36 }),
    salesEmployeeId: varchar('sales_employee_id', { length: 36 }),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    startDate: date('start_date').notNull().defaultNow(),
    endDate: date('end_date'),
    dueDay: integer('due_day').notNull().default(10),
    prorateEnabled: boolean('prorate_enabled').notNull().default(false),
    taxEnabled: boolean('tax_enabled').notNull().default(true),
    priceSnapshot: integer('price_snapshot').notNull().default(0),
    incentiveMethod: varchar('incentive_method', { length: 20 }).notNull().default('none'),
    incentiveValue: doublePrecision('incentive_value').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    customerIdx: index('subscriptions_customer_id_idx').on(table.customerId),
    planIdx: index('subscriptions_plan_id_idx').on(table.planId),
  })
);

export const subscriptionServices = pgTable(
  'subscription_services',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    subscriptionId: varchar('subscription_id', { length: 36 })
      .notNull()
      .references(() => subscriptions.id, { onDelete: 'cascade' }),
    serviceType: varchar('service_type', { length: 20 }).notNull().default('pppoe'),
    username: varchar('username', { length: 255 }).notNull(),
    routerId: varchar('router_id', { length: 36 }),
    oltId: varchar('olt_id', { length: 36 }),
    passiveDeviceId: varchar('passive_device_id', { length: 36 }),
    planProfileId: varchar('plan_profile_id', { length: 36 }),
    connectionType: varchar('connection_type', { length: 20 }),
    provisionMethod: varchar('provision_method', { length: 20 }),
    parentQueueId: varchar('parent_queue_id', { length: 100 }),
    parentQueueName: varchar('parent_queue_name', { length: 255 }),
    queueName: varchar('queue_name', { length: 255 }),
    targetIp: varchar('target_ip', { length: 45 }),
    syncSourceId: varchar('sync_source_id', { length: 100 }),
    installation: jsonb('installation'),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    installedAt: date('installed_at'),
    terminatedAt: date('terminated_at'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    subscriptionIdx: index('subscription_services_subscription_id_idx').on(
      table.subscriptionId
    ),
    routerIdx: index('subscription_services_router_id_idx').on(table.routerId),
  })
);

export const serviceCredentials = pgTable(
  'service_credentials',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    serviceId: varchar('service_id', { length: 36 })
      .notNull()
      .references(() => subscriptionServices.id, { onDelete: 'cascade' }),
    credentialType: varchar('credential_type', { length: 20 }).notNull(),
    username: varchar('username', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull().default(''),
    secretRef: varchar('secret_ref', { length: 255 }).notNull().default(''),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    serviceIdx: index('service_credentials_service_id_idx').on(table.serviceId),
  })
);

export type CustomerEntity = typeof customers.$inferSelect;
export type NewCustomerEntity = typeof customers.$inferInsert;
export type CustomerAddressEntity = typeof customerAddresses.$inferSelect;
export type NewCustomerAddressEntity = typeof customerAddresses.$inferInsert;
export type CustomerContactEntity = typeof customerContacts.$inferSelect;
export type NewCustomerContactEntity = typeof customerContacts.$inferInsert;
export type CustomerIdentityEntity = typeof customerIdentities.$inferSelect;
export type NewCustomerIdentityEntity = typeof customerIdentities.$inferInsert;
export type CustomerAccountEntity = typeof customerAccounts.$inferSelect;
export type NewCustomerAccountEntity = typeof customerAccounts.$inferInsert;
export type CustomerStatusHistoryEntity = typeof customerStatusHistory.$inferSelect;
export type SubscriptionEntity = typeof subscriptions.$inferSelect;
export type NewSubscriptionEntity = typeof subscriptions.$inferInsert;
export type SubscriptionServiceEntity = typeof subscriptionServices.$inferSelect;
export type NewSubscriptionServiceEntity = typeof subscriptionServices.$inferInsert;
export type ServiceCredentialEntity = typeof serviceCredentials.$inferSelect;
export type NewServiceCredentialEntity = typeof serviceCredentials.$inferInsert;
