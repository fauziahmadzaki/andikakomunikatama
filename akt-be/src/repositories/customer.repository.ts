import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../core/db.js';
import { branches } from '../models/branch.model.js';
import {
  customers,
  customerAddresses,
  customerContacts,
  customerIdentities,
  customerAccounts,
  customerStatusHistory,
  subscriptions,
  subscriptionServices,
  serviceCredentials,
  NewCustomerEntity,
  NewCustomerAddressEntity,
  NewCustomerContactEntity,
  NewCustomerIdentityEntity,
  NewCustomerAccountEntity,
  NewSubscriptionEntity,
  NewSubscriptionServiceEntity,
  NewServiceCredentialEntity,
} from '../models/customer.model.js';

export type RegistrationData = {
  customer: NewCustomerEntity;
  address: Omit<NewCustomerAddressEntity, 'customerId'>;
  contacts: Array<Omit<NewCustomerContactEntity, 'customerId'>>;
  identity: Omit<NewCustomerIdentityEntity, 'customerId'>;
  account: Omit<NewCustomerAccountEntity, 'customerId'>;
  subscription: Omit<NewSubscriptionEntity, 'customerId'>;
  service: Omit<NewSubscriptionServiceEntity, 'subscriptionId'>;
  credential: Omit<NewServiceCredentialEntity, 'serviceId'>;
};

export class CustomerRepository {
  async findAllBundle() {
    const [
      customerRows,
      addressRows,
      contactRows,
      identityRows,
      accountRows,
      historyRows,
      subscriptionRows,
      serviceRows,
      credentialRows,
    ] = await Promise.all([
      db.select().from(customers).orderBy(customers.createdAt),
      db.select().from(customerAddresses),
      db.select().from(customerContacts),
      db.select().from(customerIdentities),
      db.select().from(customerAccounts),
      db.select().from(customerStatusHistory),
      db.select().from(subscriptions),
      db.select().from(subscriptionServices),
      db
        .select({
          id: serviceCredentials.id,
          serviceId: serviceCredentials.serviceId,
          credentialType: serviceCredentials.credentialType,
          username: serviceCredentials.username,
          secretRef: serviceCredentials.secretRef,
          isActive: serviceCredentials.isActive,
        })
        .from(serviceCredentials),
    ]);

    return {
      customers: customerRows,
      addresses: addressRows,
      contacts: contactRows,
      identities: identityRows,
      accounts: accountRows,
      statusHistory: historyRows,
      subscriptions: subscriptionRows,
      services: serviceRows,
      credentials: credentialRows,
    };
  }

  async findBundleById(customerId: string) {
    const customer = await this.findCustomerById(customerId);
    if (!customer) return null;

    const [addresses, contacts, identities, account, statusHistory, subscriptionRows] =
      await Promise.all([
        db
          .select()
          .from(customerAddresses)
          .where(eq(customerAddresses.customerId, customerId)),
        db
          .select()
          .from(customerContacts)
          .where(eq(customerContacts.customerId, customerId)),
        db
          .select()
          .from(customerIdentities)
          .where(eq(customerIdentities.customerId, customerId)),
        db
          .select()
          .from(customerAccounts)
          .where(eq(customerAccounts.customerId, customerId))
          .limit(1),
        db
          .select()
          .from(customerStatusHistory)
          .where(eq(customerStatusHistory.customerId, customerId)),
        db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.customerId, customerId)),
      ]);

    const subscriptionIds = subscriptionRows.map((item) => item.id);
    const services = subscriptionIds.length
      ? await db
          .select()
          .from(subscriptionServices)
          .where(inArray(subscriptionServices.subscriptionId, subscriptionIds))
      : [];

    const serviceIds = services.map((item) => item.id);
    const credentials = serviceIds.length
      ? await db
          .select({
            id: serviceCredentials.id,
            serviceId: serviceCredentials.serviceId,
            credentialType: serviceCredentials.credentialType,
            username: serviceCredentials.username,
            secretRef: serviceCredentials.secretRef,
            isActive: serviceCredentials.isActive,
          })
          .from(serviceCredentials)
          .where(inArray(serviceCredentials.serviceId, serviceIds))
      : [];

    return {
      customers: [customer],
      addresses,
      contacts,
      identities,
      accounts: account,
      statusHistory,
      subscriptions: subscriptionRows,
      services,
      credentials,
    };
  }

  async findCustomerById(id: string) {
    const result = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);
    return result[0];
  }

  async findByCustomerNumber(customerNumber: string) {
    const result = await db
      .select()
      .from(customers)
      .where(eq(customers.customerNumber, customerNumber))
      .limit(1);
    return result[0];
  }

  async findContactsAndIdentities() {
    const [contacts, identities] = await Promise.all([
      db.select().from(customerContacts),
      db.select().from(customerIdentities),
    ]);
    return { contacts, identities };
  }

  async countSubscriptions() {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(subscriptions);
    return result[0]?.count ?? 0;
  }

  async createRegistration(data: RegistrationData) {
    return db.transaction(async (tx) => {
      const customerResult = await tx
        .insert(customers)
        .values(data.customer)
        .returning();
      const customer = customerResult[0];

      const addressResult = await tx
        .insert(customerAddresses)
        .values({ ...data.address, customerId: customer.id })
        .returning();

      const contactResult = await tx
        .insert(customerContacts)
        .values(data.contacts.map((item) => ({ ...item, customerId: customer.id })))
        .returning();

      const identityResult = await tx
        .insert(customerIdentities)
        .values({ ...data.identity, customerId: customer.id })
        .returning();

      const accountResult = await tx
        .insert(customerAccounts)
        .values({ ...data.account, customerId: customer.id })
        .returning();

      const historyResult = await tx
        .insert(customerStatusHistory)
        .values({
          customerId: customer.id,
          status: customer.status,
          reason: 'Pelanggan dibuat.',
          changedBy: 'System',
        })
        .returning();

      const subscriptionResult = await tx
        .insert(subscriptions)
        .values({ ...data.subscription, customerId: customer.id })
        .returning();
      const subscription = subscriptionResult[0];

      const serviceResult = await tx
        .insert(subscriptionServices)
        .values({ ...data.service, subscriptionId: subscription.id })
        .returning();
      const service = serviceResult[0];

      const credentialResult = await tx
        .insert(serviceCredentials)
        .values({ ...data.credential, serviceId: service.id })
        .returning();

      await tx
        .update(branches)
        .set({ customerCount: sql`${branches.customerCount} + 1`, updatedAt: new Date() })
        .where(eq(branches.id, customer.branchId));

      return {
        customer,
        address: addressResult[0],
        contacts: contactResult,
        identity: identityResult[0],
        account: accountResult[0],
        statusHistory: historyResult[0],
        subscription,
        service,
        credential: credentialResult[0],
      };
    });
  }

  async updateCustomer(id: string, patch: Partial<NewCustomerEntity>) {
    const result = await db
      .update(customers)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return result[0];
  }

  async deleteCustomer(id: string) {
    return db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(customers)
        .where(eq(customers.id, id))
        .limit(1);
      const customer = existing[0];
      if (!customer) return false;

      await tx.delete(customers).where(eq(customers.id, id));
      await tx
        .update(branches)
        .set({
          customerCount: sql`GREATEST(${branches.customerCount} - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(branches.id, customer.branchId));

      return true;
    });
  }

  async updateStatus(id: string, status: string, reason: string, changedBy: string) {
    const updated = await this.updateCustomer(id, { status });
    if (!updated) return undefined;

    await db.insert(customerStatusHistory).values({
      customerId: id,
      status,
      reason,
      changedBy,
    });

    return updated;
  }

  async addAddress(customerId: string, data: Omit<NewCustomerAddressEntity, 'customerId'>) {
    return db.transaction(async (tx) => {
      if (data.isPrimary) {
        await tx
          .update(customerAddresses)
          .set({ isPrimary: false, updatedAt: new Date() })
          .where(eq(customerAddresses.customerId, customerId));
      }
      const result = await tx
        .insert(customerAddresses)
        .values({ ...data, customerId })
        .returning();
      return result[0];
    });
  }

  async updateAddress(
    customerId: string,
    addressId: string,
    data: Partial<NewCustomerAddressEntity>
  ) {
    return db.transaction(async (tx) => {
      if (data.isPrimary) {
        await tx
          .update(customerAddresses)
          .set({ isPrimary: false, updatedAt: new Date() })
          .where(eq(customerAddresses.customerId, customerId));
      }
      const result = await tx
        .update(customerAddresses)
        .set({ ...data, updatedAt: new Date() })
        .where(
          and(
            eq(customerAddresses.id, addressId),
            eq(customerAddresses.customerId, customerId)
          )
        )
        .returning();
      return result[0];
    });
  }

  async deleteAddress(customerId: string, addressId: string) {
    const result = await db
      .delete(customerAddresses)
      .where(
        and(
          eq(customerAddresses.id, addressId),
          eq(customerAddresses.customerId, customerId)
        )
      )
      .returning();
    return result.length > 0;
  }

  async addContact(customerId: string, data: Omit<NewCustomerContactEntity, 'customerId'>) {
    return db.transaction(async (tx) => {
      if (data.isPrimary) {
        await tx
          .update(customerContacts)
          .set({ isPrimary: false, updatedAt: new Date() })
          .where(eq(customerContacts.customerId, customerId));
      }
      const result = await tx
        .insert(customerContacts)
        .values({ ...data, customerId })
        .returning();
      return result[0];
    });
  }

  async updateContact(
    customerId: string,
    contactId: string,
    data: Partial<NewCustomerContactEntity>
  ) {
    const result = await db
      .update(customerContacts)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(customerContacts.id, contactId),
          eq(customerContacts.customerId, customerId)
        )
      )
      .returning();
    return result[0];
  }

  async deleteContact(customerId: string, contactId: string) {
    const result = await db
      .delete(customerContacts)
      .where(
        and(
          eq(customerContacts.id, contactId),
          eq(customerContacts.customerId, customerId)
        )
      )
      .returning();
    return result.length > 0;
  }

  async addIdentity(
    customerId: string,
    data: Omit<NewCustomerIdentityEntity, 'customerId'>
  ) {
    const result = await db
      .insert(customerIdentities)
      .values({ ...data, customerId })
      .returning();
    return result[0];
  }

  async updateIdentity(
    customerId: string,
    identityId: string,
    data: Partial<NewCustomerIdentityEntity>
  ) {
    const result = await db
      .update(customerIdentities)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(customerIdentities.id, identityId),
          eq(customerIdentities.customerId, customerId)
        )
      )
      .returning();
    return result[0];
  }

  async deleteIdentity(customerId: string, identityId: string) {
    const result = await db
      .delete(customerIdentities)
      .where(
        and(
          eq(customerIdentities.id, identityId),
          eq(customerIdentities.customerId, customerId)
        )
      )
      .returning();
    return result.length > 0;
  }

  async upsertAccount(
    customerId: string,
    data: Omit<NewCustomerAccountEntity, 'customerId'>
  ) {
    const existing = await db
      .select()
      .from(customerAccounts)
      .where(eq(customerAccounts.customerId, customerId))
      .limit(1);

    if (existing[0]) {
      const result = await db
        .update(customerAccounts)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(customerAccounts.customerId, customerId))
        .returning();
      return result[0];
    }

    const result = await db
      .insert(customerAccounts)
      .values({ ...data, customerId })
      .returning();
    return result[0];
  }

  async updateServiceStatus(serviceId: string, status: string) {
    const result = await db
      .update(subscriptionServices)
      .set({ status, updatedAt: new Date() })
      .where(eq(subscriptionServices.id, serviceId))
      .returning();
    return result[0];
  }
}

export const customerRepository = new CustomerRepository();
