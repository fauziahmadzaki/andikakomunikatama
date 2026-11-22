import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateUUID } from "@/lib/uuid";

import { useAuditStore } from "@/features/audit/store/audit-store";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useBranchStore } from "@/features/branches/store/branch-store";
import {
  customerNumberFromDateString,
  isCustomerNumber,
  nextCustomerNumber,
  seedCustomerAccounts,
  seedCustomerAddresses,
  seedCustomerContacts,
  seedCustomerIdentities,
  seedCustomers,
  seedCustomerStatusHistory,
} from "../data/seed";
import type {
  Customer,
  CustomerAccount,
  CustomerAddress,
  CustomerContact,
  CustomerDraft,
  CustomerIdentity,
  CustomerStatus,
  CustomerStatusHistory,
  ImportRow,
} from "../data/types";

export type NewCustomerInput = Omit<
  Customer,
  "id" | "customerNumber" | "registeredAt"
> & {
  customerNumber?: string;
  registeredAt?: string;
  address?: Omit<CustomerAddress, "id" | "customerId">;
  contact?: Omit<CustomerContact, "id" | "customerId">;
  identity?: Omit<CustomerIdentity, "id" | "customerId">;
  account?: Omit<CustomerAccount, "id" | "customerId">;
};

type CustomerState = {
  customers: Customer[];
  addresses: CustomerAddress[];
  contacts: CustomerContact[];
  identities: CustomerIdentity[];
  statusHistory: CustomerStatusHistory[];
  accounts: CustomerAccount[];
  drafts: CustomerDraft[];
  createCustomer: (input: NewCustomerInput, actor?: string) => Customer;
  updateCustomer: (id: string, patch: Partial<Customer>, actor?: string) => void;
  setStatus: (
    id: string,
    status: CustomerStatus,
    reason?: string,
    actor?: string
  ) => void;
  addAddress: (
    input: Omit<CustomerAddress, "id">,
    actor?: string
  ) => void;
  updateAddress: (
    id: string,
    patch: Partial<CustomerAddress>,
    actor?: string
  ) => void;
  removeAddress: (id: string, actor?: string) => void;
  addContact: (input: Omit<CustomerContact, "id">, actor?: string) => void;
  updateContact: (
    id: string,
    patch: Partial<CustomerContact>,
    actor?: string
  ) => void;
  removeContact: (id: string, actor?: string) => void;
  addIdentity: (input: Omit<CustomerIdentity, "id">, actor?: string) => void;
  updateIdentity: (
    id: string,
    patch: Partial<CustomerIdentity>,
    actor?: string
  ) => void;
  removeIdentity: (id: string, actor?: string) => void;
  upsertAccount: (
    input: Omit<CustomerAccount, "id">,
    actor?: string
  ) => void;
  saveDraft: (draft: CustomerDraft) => void;
  deleteDraft: (id: string) => void;
  importCustomers: (rows: ImportRow[], actor?: string) => Customer[];
  deleteCustomers: (ids: string[], actor?: string) => void;
  resetCustomers: () => void;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function id() {
  return generateUUID();
}

function actorName(actor?: string) {
  return actor ?? useAuthStore.getState().session?.name ?? "Customer Service";
}

function audit(
  action: string,
  entityId: string,
  description: string,
  branch: string,
  actor?: string
) {
  useAuditStore.getState().addAudit({
    action,
    entityType: "customer",
    entityId,
    actor: actorName(actor),
    branch,
    description,
  });
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customers: seedCustomers,
      addresses: seedCustomerAddresses,
      contacts: seedCustomerContacts,
      identities: seedCustomerIdentities,
      statusHistory: seedCustomerStatusHistory,
      accounts: seedCustomerAccounts,
      drafts: [],

      createCustomer: (input, actor) => {
        const customer: Customer = {
          id: id(),
          branchId: input.branchId,
          salesEmployeeId: input.salesEmployeeId,
          customerNumber:
            input.customerNumber?.trim() ||
            nextCustomerNumber(get().customers),
          fullName: input.fullName,
          customerType: input.customerType,
          registrationType: input.registrationType,
          status: input.status,
          registeredAt: input.registeredAt ?? today(),
          notes: input.notes,
        };

        const address: CustomerAddress | undefined = input.address
          ? { ...input.address, id: id(), customerId: customer.id }
          : undefined;
        const contact: CustomerContact | undefined = input.contact
          ? { ...input.contact, id: id(), customerId: customer.id }
          : undefined;
        const identity: CustomerIdentity | undefined = input.identity
          ? { ...input.identity, id: id(), customerId: customer.id }
          : undefined;
        const account: CustomerAccount | undefined = input.account
          ? { ...input.account, id: id(), customerId: customer.id }
          : undefined;

        set((state) => ({
          customers: [customer, ...state.customers],
          addresses: address ? [address, ...state.addresses] : state.addresses,
          contacts: contact ? [contact, ...state.contacts] : state.contacts,
          identities: identity ? [identity, ...state.identities] : state.identities,
          accounts: account ? [account, ...state.accounts] : state.accounts,
          statusHistory: [
            {
              id: id(),
              customerId: customer.id,
              status: customer.status,
              reason: "Pelanggan dibuat.",
              changedBy: actorName(actor),
              changedAt: new Date().toISOString(),
            },
            ...state.statusHistory,
          ],
        }));

        audit(
          "customer.created",
          customer.customerNumber,
          `Pelanggan ${customer.fullName} ditambahkan.`,
          customer.branchId,
          actor
        );
        return customer;
      },

      updateCustomer: (customerId, patch, actor) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId ? { ...customer, ...patch } : customer
          ),
        }));
        const customer = get().customers.find((item) => item.id === customerId);
        audit(
          "customer.updated",
          customer?.customerNumber ?? customerId,
          `Data pelanggan ${customer?.fullName ?? customerId} diperbarui.`,
          customer?.branchId ?? "br-jkt",
          actor
        );
      },

      setStatus: (customerId, status, reason = "Status diubah.", actor) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId ? { ...customer, status } : customer
          ),
          statusHistory: [
            {
              id: id(),
              customerId,
              status,
              reason,
              changedBy: actorName(actor),
              changedAt: new Date().toISOString(),
            },
            ...state.statusHistory,
          ],
        }));
        const customer = get().customers.find((item) => item.id === customerId);
        audit(
          status === "active" ? "customer.reactivated" : "customer.deactivated",
          customer?.customerNumber ?? customerId,
          `Status pelanggan ${customer?.fullName ?? customerId} menjadi ${status}.`,
          customer?.branchId ?? "br-jkt",
          actor
        );
      },

      addAddress: (input, actor) => {
        const address: CustomerAddress = { ...input, id: id() };
        set((state) => ({
          addresses: [
            address,
            ...state.addresses.map((item) =>
              item.customerId === input.customerId && input.isPrimary
                ? { ...item, isPrimary: false }
                : item
            ),
          ],
        }));
        audit(
          "customer.address_created",
          address.id,
          `Alamat pelanggan ditambahkan.`,
          "br-jkt",
          actor
        );
      },

      updateAddress: (addressId, patch, actor) => {
        set((state) => ({
          addresses: state.addresses.map((address) =>
            address.id === addressId ? { ...address, ...patch } : address
          ),
        }));
        audit(
          "customer.address_updated",
          addressId,
          "Alamat pelanggan diperbarui.",
          "br-jkt",
          actor
        );
      },

      removeAddress: (addressId, actor) => {
        set((state) => ({
          addresses: state.addresses.filter((address) => address.id !== addressId),
        }));
        audit(
          "customer.address_removed",
          addressId,
          "Alamat pelanggan dihapus.",
          "br-jkt",
          actor
        );
      },

      addContact: (input, actor) => {
        const contact: CustomerContact = { ...input, id: id() };
        set((state) => ({
          contacts: [
            contact,
            ...state.contacts.map((item) =>
              item.customerId === input.customerId && input.isPrimary
                ? { ...item, isPrimary: false }
                : item
            ),
          ],
        }));
        audit(
          "customer.contact_created",
          contact.id,
          "Kontak pelanggan ditambahkan.",
          "br-jkt",
          actor
        );
      },

      updateContact: (contactId, patch, actor) => {
        set((state) => ({
          contacts: state.contacts.map((contact) =>
            contact.id === contactId ? { ...contact, ...patch } : contact
          ),
        }));
        audit(
          "customer.contact_updated",
          contactId,
          "Kontak pelanggan diperbarui.",
          "br-jkt",
          actor
        );
      },

      removeContact: (contactId, actor) => {
        set((state) => ({
          contacts: state.contacts.filter((contact) => contact.id !== contactId),
        }));
        audit(
          "customer.contact_removed",
          contactId,
          "Kontak pelanggan dihapus.",
          "br-jkt",
          actor
        );
      },

      addIdentity: (input, actor) => {
        const identity: CustomerIdentity = { ...input, id: id() };
        set((state) => ({
          identities: [identity, ...state.identities],
        }));
        audit(
          "customer.identity_created",
          identity.id,
          "Identitas pelanggan ditambahkan.",
          "br-jkt",
          actor
        );
      },

      updateIdentity: (identityId, patch, actor) => {
        set((state) => ({
          identities: state.identities.map((identity) =>
            identity.id === identityId ? { ...identity, ...patch } : identity
          ),
        }));
        audit(
          "customer.identity_updated",
          identityId,
          "Identitas pelanggan diperbarui.",
          "br-jkt",
          actor
        );
      },

      removeIdentity: (identityId, actor) => {
        set((state) => ({
          identities: state.identities.filter(
            (identity) => identity.id !== identityId
          ),
        }));
        audit(
          "customer.identity_removed",
          identityId,
          "Identitas pelanggan dihapus.",
          "br-jkt",
          actor
        );
      },

      upsertAccount: (input, actor) => {
        const existing = get().accounts.find(
          (account) => account.customerId === input.customerId
        );
        if (existing) {
          set((state) => ({
            accounts: state.accounts.map((account) =>
              account.id === existing.id ? { ...account, ...input } : account
            ),
          }));
        } else {
          set((state) => ({
            accounts: [{ ...input, id: id() }, ...state.accounts],
          }));
        }
        audit(
          existing ? "customer.account_updated" : "customer.account_created",
          input.customerId,
          "Akun portal pelanggan diperbarui.",
          "br-jkt",
          actor
        );
      },

      saveDraft: (draft) => {
        set((state) => ({
          drafts: [
            { ...draft, updatedAt: new Date().toISOString() },
            ...state.drafts.filter((item) => item.id !== draft.id),
          ],
        }));
      },

      deleteDraft: (draftId) => {
        set((state) => ({
          drafts: state.drafts.filter((draft) => draft.id !== draftId),
        }));
      },

      importCustomers: (rows, actor) => {
        const created: Customer[] = [];
        let customers = get().customers;
        const branches = useBranchStore.getState().branches;

        for (const row of rows) {
          if (row.status === "error") {
            continue;
          }
          const branch =
            branches.find((item) => item.name === row.branchName) ??
            branches[0];
          const customer: Customer = {
            id: id(),
            branchId: branch?.id ?? "br-jkt",
            customerNumber: nextCustomerNumber([...customers, ...created]),
            fullName: row.name,
            customerType: row.planName.startsWith("Bisnis")
              ? "business"
              : "residential",
            registrationType: "existing",
            status: "active",
            registeredAt: today(),
            notes: row.message,
          };
          created.push(customer);
          customers = [...customers, customer];
        }

        if (created.length > 0) {
          const addresses: CustomerAddress[] = created.map((customer) => ({
            id: id(),
            customerId: customer.id,
            addressType: "home",
            addressLine: "Alamat dari import",
            village: "-",
            district: "-",
            city:
              branches.find((branch) => branch.id === customer.branchId)?.name ??
              "-",
            province: "-",
            postalCode: "-",
            isPrimary: true,
          }));
          const contacts: CustomerContact[] = created.flatMap((customer, index) => {
            const row = rows.filter((item) => item.status !== "error")[index];
            return row
              ? [
                  {
                    id: id(),
                    customerId: customer.id,
                    contactType: "phone" as const,
                    value: row.phone,
                    isPrimary: true,
                    isVerified: false,
                  },
                ]
              : [];
          });
          const identities: CustomerIdentity[] = created.flatMap(
            (customer, index) => {
              const row = rows.filter((item) => item.status !== "error")[index];
              return row
                ? [
                    {
                      id: id(),
                      customerId: customer.id,
                      identityType:
                        customer.customerType === "business"
                          ? ("npwp" as const)
                          : ("ktp" as const),
                      identityNumber: row.nik,
                    },
                  ]
                : [];
            }
          );
          const history: CustomerStatusHistory[] = created.map((customer) => ({
            id: id(),
            customerId: customer.id,
            status: "active",
            reason: "Import pelanggan.",
            changedBy: actorName(actor),
            changedAt: new Date().toISOString(),
          }));

          set((state) => ({
            customers: [...created, ...state.customers],
            addresses: [...addresses, ...state.addresses],
            contacts: [...contacts, ...state.contacts],
            identities: [...identities, ...state.identities],
            statusHistory: [...history, ...state.statusHistory],
          }));
          audit(
            "customer.imported",
            `IMP-${Date.now()}`,
            `${created.length} pelanggan diimport.`,
            "br-jkt",
            actor
          );
        }

        return created;
      },

      resetCustomers: () => {
        set({
          customers: seedCustomers,
          addresses: seedCustomerAddresses,
          contacts: seedCustomerContacts,
          identities: seedCustomerIdentities,
          statusHistory: seedCustomerStatusHistory,
          accounts: seedCustomerAccounts,
          drafts: [],
        });
      },

      deleteCustomers: (ids, actor) => {
        const idSet = new Set(ids);
        const removed = get().customers.filter((customer) =>
          idSet.has(customer.id)
        );

        set((state) => ({
          customers: state.customers.filter(
            (customer) => !idSet.has(customer.id)
          ),
          addresses: state.addresses.filter(
            (address) => !idSet.has(address.customerId)
          ),
          contacts: state.contacts.filter(
            (contact) => !idSet.has(contact.customerId)
          ),
          identities: state.identities.filter(
            (identity) => !idSet.has(identity.customerId)
          ),
          accounts: state.accounts.filter(
            (account) => !idSet.has(account.customerId)
          ),
          statusHistory: state.statusHistory.filter(
            (history) => !idSet.has(history.customerId)
          ),
        }));

        removed.forEach((customer) => {
          audit(
            "customer.deleted",
            customer.customerNumber,
            `Pelanggan ${customer.fullName} dihapus.`,
            customer.branchId,
            actor
          );
        });
      },
    }),
    {
      name: "muranet-customers-v2",
      skipHydration: true,
      version: 2,
      migrate: (persistedState, version) => {
        if (version >= 2) {
          return persistedState as CustomerState;
        }

        const state = (persistedState ?? {}) as Partial<CustomerState>;
        const customers = Array.isArray(state.customers)
          ? [...state.customers]
          : [...seedCustomers];

        customers.forEach((customer, index) => {
          const next = { ...customer };
          if (!isCustomerNumber(next.customerNumber)) {
            next.customerNumber = customerNumberFromDateString(
              next.registeredAt,
              index
            );
          }
          if (!next.registrationType) {
            next.registrationType = "existing";
          }
          customers[index] = next;
        });

        return { ...state, customers } as CustomerState;
      },
    }
  )
);
