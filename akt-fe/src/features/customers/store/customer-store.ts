import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateUUID } from "@/lib/uuid";

import { useAuditStore } from "@/features/audit/store/audit-store";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useBranchStore } from "@/features/branches/store/branch-store";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription-store";
import type { RouterSyncResult } from "@/features/plan-profiles/data/types";
import { apiClient } from "@/lib/api-client";
import { nextCustomerNumber } from "../data/seed";
import type {
  Customer,
  CustomerAccount,
  CustomerAddress,
  CustomerBundle,
  CustomerContact,
  CustomerDraft,
  CustomerIdentity,
  CustomerStatus,
  CustomerStatusHistory,
  ImportRow,
  RegisterCustomerPayload,
} from "../data/types";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type RegisterResult = {
  customerId: string;
  routerSync?: RouterSyncResult;
  provisioning?: { username: string; password: string };
};

type RegisterResponseData = {
  customer: { id: string };
  routerSync?: RouterSyncResult;
  provisioning?: { username: string; password: string };
};

type CustomerState = {
  customers: Customer[];
  addresses: CustomerAddress[];
  contacts: CustomerContact[];
  identities: CustomerIdentity[];
  statusHistory: CustomerStatusHistory[];
  accounts: CustomerAccount[];
  drafts: CustomerDraft[];
  isLoading: boolean;
  fetchCustomers: () => Promise<void>;
  registerCustomer: (input: RegisterCustomerPayload) => Promise<RegisterResult>;
  updateCustomer: (id: string, patch: Partial<Customer>) => Promise<void>;
  setStatus: (
    id: string,
    status: CustomerStatus,
    reason?: string
  ) => Promise<void>;
  addAddress: (input: Omit<CustomerAddress, "id">) => Promise<void>;
  updateAddress: (id: string, patch: Partial<CustomerAddress>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  addContact: (input: Omit<CustomerContact, "id">) => Promise<void>;
  updateContact: (id: string, patch: Partial<CustomerContact>) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
  addIdentity: (input: Omit<CustomerIdentity, "id">) => Promise<void>;
  updateIdentity: (id: string, patch: Partial<CustomerIdentity>) => Promise<void>;
  removeIdentity: (id: string) => Promise<void>;
  upsertAccount: (input: Omit<CustomerAccount, "id">) => Promise<void>;
  saveDraft: (draft: CustomerDraft) => void;
  deleteDraft: (id: string) => void;
  importCustomers: (rows: ImportRow[], actor?: string) => Customer[];
  deleteCustomers: (ids: string[]) => Promise<void>;
  resetCustomers: () => void;
};

function id() {
  return generateUUID();
}

function today() {
  return new Date().toISOString().slice(0, 10);
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

function nullToUndefined<T>(row: T): T {
  if (!row || typeof row !== "object") return row;
  return Object.fromEntries(
    Object.entries(row as Record<string, unknown>).map(([key, value]) => [
      key,
      value === null ? undefined : value,
    ])
  ) as T;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customers: [],
      addresses: [],
      contacts: [],
      identities: [],
      statusHistory: [],
      accounts: [],
      drafts: [],
      isLoading: false,

      fetchCustomers: async () => {
        set({ isLoading: true });
        try {
          const response =
            await apiClient.get<ApiEnvelope<CustomerBundle>>("/customers");
          const bundle = response.data.data;

          const subscriptions = bundle.subscriptions.map(nullToUndefined);
          const services = bundle.services.map(nullToUndefined);
          const credentials = bundle.credentials.map(nullToUndefined);

          set({
            customers: bundle.customers.map(nullToUndefined),
            addresses: bundle.addresses.map(nullToUndefined),
            contacts: bundle.contacts.map(nullToUndefined),
            identities: bundle.identities.map(nullToUndefined),
            statusHistory: bundle.statusHistory.map(nullToUndefined),
            accounts: bundle.accounts.map(nullToUndefined),
            isLoading: false,
          });

          useSubscriptionStore.getState().hydrateRemote({
            subscriptions,
            services,
            credentials,
          });
        } catch (error) {
          console.warn("Gagal mengambil data pelanggan dari backend:", error);
          set({ isLoading: false });
        }
      },

      registerCustomer: async (input) => {
        const response = await apiClient.post<ApiEnvelope<RegisterResponseData>>(
          "/customers/register",
          input
        );

        await get().fetchCustomers();

        return {
          customerId: response.data.data.customer.id,
          routerSync: response.data.data.routerSync,
          provisioning: response.data.data.provisioning,
        };
      },

      updateCustomer: async (customerId, patch) => {
        const response = await apiClient.patch<ApiEnvelope<Customer>>(
          `/customers/${customerId}`,
          patch
        );
        const updated = nullToUndefined(response.data.data);
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId ? updated : customer
          ),
        }));
      },

      setStatus: async (customerId, status, reason = "Status diubah.") => {
        const response = await apiClient.patch<ApiEnvelope<Customer>>(
          `/customers/${customerId}/status`,
          { status, reason }
        );
        const updated = nullToUndefined(response.data.data);
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId ? updated : customer
          ),
          statusHistory: [
            {
              id: id(),
              customerId,
              status,
              reason,
              changedBy: actorName(),
              changedAt: new Date().toISOString(),
            },
            ...state.statusHistory,
          ],
        }));
      },

      addAddress: async (input) => {
        const response = await apiClient.post<ApiEnvelope<CustomerAddress>>(
          `/customers/${input.customerId}/addresses`,
          input
        );
        const address = nullToUndefined(response.data.data);
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
      },

      updateAddress: async (addressId, patch) => {
        const address = get().addresses.find((item) => item.id === addressId);
        if (!address) return;
        const response = await apiClient.patch<ApiEnvelope<CustomerAddress>>(
          `/customers/${address.customerId}/addresses/${addressId}`,
          patch
        );
        const updated = nullToUndefined(response.data.data);
        set((state) => ({
          addresses: state.addresses.map((item) =>
            item.id === addressId ? updated : item
          ),
        }));
      },

      removeAddress: async (addressId) => {
        const address = get().addresses.find((item) => item.id === addressId);
        if (!address) return;
        await apiClient.delete(
          `/customers/${address.customerId}/addresses/${addressId}`
        );
        set((state) => ({
          addresses: state.addresses.filter((item) => item.id !== addressId),
        }));
      },

      addContact: async (input) => {
        const response = await apiClient.post<ApiEnvelope<CustomerContact>>(
          `/customers/${input.customerId}/contacts`,
          input
        );
        const contact = nullToUndefined(response.data.data);
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
      },

      updateContact: async (contactId, patch) => {
        const contact = get().contacts.find((item) => item.id === contactId);
        if (!contact) return;
        const response = await apiClient.patch<ApiEnvelope<CustomerContact>>(
          `/customers/${contact.customerId}/contacts/${contactId}`,
          patch
        );
        const updated = nullToUndefined(response.data.data);
        set((state) => ({
          contacts: state.contacts.map((item) =>
            item.id === contactId ? updated : item
          ),
        }));
      },

      removeContact: async (contactId) => {
        const contact = get().contacts.find((item) => item.id === contactId);
        if (!contact) return;
        await apiClient.delete(
          `/customers/${contact.customerId}/contacts/${contactId}`
        );
        set((state) => ({
          contacts: state.contacts.filter((item) => item.id !== contactId),
        }));
      },

      addIdentity: async (input) => {
        const response = await apiClient.post<ApiEnvelope<CustomerIdentity>>(
          `/customers/${input.customerId}/identities`,
          input
        );
        const identity = nullToUndefined(response.data.data);
        set((state) => ({ identities: [identity, ...state.identities] }));
      },

      updateIdentity: async (identityId, patch) => {
        const identity = get().identities.find((item) => item.id === identityId);
        if (!identity) return;
        const response = await apiClient.patch<ApiEnvelope<CustomerIdentity>>(
          `/customers/${identity.customerId}/identities/${identityId}`,
          patch
        );
        const updated = nullToUndefined(response.data.data);
        set((state) => ({
          identities: state.identities.map((item) =>
            item.id === identityId ? updated : item
          ),
        }));
      },

      removeIdentity: async (identityId) => {
        const identity = get().identities.find((item) => item.id === identityId);
        if (!identity) return;
        await apiClient.delete(
          `/customers/${identity.customerId}/identities/${identityId}`
        );
        set((state) => ({
          identities: state.identities.filter((item) => item.id !== identityId),
        }));
      },

      upsertAccount: async (input) => {
        const response = await apiClient.put<ApiEnvelope<CustomerAccount>>(
          `/customers/${input.customerId}/account`,
          input
        );
        const account = nullToUndefined(response.data.data);
        set((state) => {
          const exists = state.accounts.some(
            (item) => item.customerId === input.customerId
          );
          return {
            accounts: exists
              ? state.accounts.map((item) =>
                  item.customerId === input.customerId ? account : item
                )
              : [account, ...state.accounts],
          };
        });
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
          if (row.status === "error") continue;

          const branch =
            branches.find((item) => item.name === row.branchName) ?? branches[0];
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

      deleteCustomers: async (ids) => {
        await Promise.all(ids.map((customerId) => apiClient.delete(`/customers/${customerId}`)));

        const idSet = new Set(ids);
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

        const subscriptionState = useSubscriptionStore.getState();
        const subscriptionIds = new Set(
          subscriptionState.subscriptions
            .filter((subscription) => idSet.has(subscription.customerId))
            .map((subscription) => subscription.id)
        );
        subscriptionState.hydrateRemote({
          subscriptions: subscriptionState.subscriptions.filter(
            (subscription) => !idSet.has(subscription.customerId)
          ),
          services: subscriptionState.services.filter(
            (service) => !subscriptionIds.has(service.subscriptionId)
          ),
          credentials: subscriptionState.credentials.filter((credential) => {
            const service = subscriptionState.services.find(
              (item) => item.id === credential.serviceId
            );
            return service ? !subscriptionIds.has(service.subscriptionId) : true;
          }),
        });
      },

      resetCustomers: () => {
        set({
          customers: [],
          addresses: [],
          contacts: [],
          identities: [],
          statusHistory: [],
          accounts: [],
          drafts: [],
        });
      },
    }),
    {
      name: "muranet-customers-v2",
      skipHydration: true,
      version: 3,
      migrate: () =>
        ({
          customers: [],
          addresses: [],
          contacts: [],
          identities: [],
          statusHistory: [],
          accounts: [],
          drafts: [],
        }) as unknown as CustomerState,
    }
  )
);
