import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useFoundationStore } from "@/features/foundation/store/foundation-store";
import { useAuthStore } from "@/features/auth/store/auth-store";
import {
  nextCustomerNumber,
  planOptions,
  seedCustomers,
  seedInvoices,
  seedSegments,
  seedServices,
  seedTickets,
} from "../data/seed";
import type {
  Customer,
  CustomerDraft,
  CustomerInvoice,
  CustomerSegment,
  CustomerService,
  CustomerStatus,
  CustomerTicket,
  ImportRow,
} from "../data/types";

type NewCustomer = Omit<Customer, "id" | "customerNumber" | "registeredAt">;

type CustomerState = {
  customers: Customer[];
  segments: CustomerSegment[];
  drafts: CustomerDraft[];
  invoices: CustomerInvoice[];
  tickets: CustomerTicket[];
  services: CustomerService[];
  addCustomer: (input: NewCustomer, actor?: string) => Customer;
  updateCustomer: (id: string, patch: Partial<Customer>, actor?: string) => void;
  setStatus: (id: string, status: CustomerStatus, actor?: string) => void;
  addSegment: (input: Omit<CustomerSegment, "id" | "createdAt">) => void;
  deleteSegment: (id: string) => void;
  saveDraft: (draft: CustomerDraft) => void;
  deleteDraft: (id: string) => void;
  importCustomers: (rows: ImportRow[], actor?: string) => number;
  resetCustomers: () => void;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function id() {
  return crypto.randomUUID();
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customers: seedCustomers,
      segments: seedSegments,
      drafts: [],
      invoices: seedInvoices,
      tickets: seedTickets,
      services: seedServices,

      addCustomer: (input, actor) => {
        const customer: Customer = {
          ...input,
          id: id(),
          customerNumber: nextCustomerNumber(get().customers),
          registeredAt: today(),
        };
        set((state) => ({ customers: [customer, ...state.customers] }));
        useFoundationStore.getState().addAudit({
          action: "customer.created",
          entityType: "customer",
          entityId: customer.customerNumber,
          actor: actor ?? useAuthStore.getState().session?.name ?? "Customer Service",
          branch: customer.branchName,
          description: `Pelanggan ${customer.fullName} ditambahkan.`,
        });
        return customer;
      },

      updateCustomer: (customerId, patch, actor) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId ? { ...customer, ...patch } : customer
          ),
        }));
        const customer = get().customers.find((item) => item.id === customerId);
        useFoundationStore.getState().addAudit({
          action: "customer.updated",
          entityType: "customer",
          entityId: customer?.customerNumber ?? customerId,
          actor: actor ?? useAuthStore.getState().session?.name ?? "Customer Service",
          branch: customer?.branchName ?? "JKT-01",
          description: `Data pelanggan ${customer?.fullName ?? customerId} diperbarui.`,
        });
      },

      setStatus: (customerId, status, actor) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId ? { ...customer, status } : customer
          ),
        }));
        const customer = get().customers.find((item) => item.id === customerId);
        useFoundationStore.getState().addAudit({
          action: status === "active" ? "customer.reactivated" : "customer.deactivated",
          entityType: "customer",
          entityId: customer?.customerNumber ?? customerId,
          actor: actor ?? useAuthStore.getState().session?.name ?? "Customer Service",
          branch: customer?.branchName ?? "JKT-01",
          description: `Status pelanggan ${customer?.fullName ?? customerId} menjadi ${status}.`,
        });
      },

      addSegment: (input) => {
        const segment: CustomerSegment = {
          ...input,
          id: id(),
          createdAt: today(),
        };
        set((state) => ({ segments: [segment, ...state.segments] }));
        useFoundationStore.getState().addAudit({
          action: "customer.segment.created",
          entityType: "customer_segment",
          entityId: segment.name,
          actor: useAuthStore.getState().session?.name ?? "Administrator",
          branch: "JKT-01",
          description: `Segmen ${segment.name} dibuat.`,
        });
      },

      deleteSegment: (segmentId) => {
        set((state) => ({
          segments: state.segments.filter((segment) => segment.id !== segmentId),
        }));
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
        let count = 0;
        const created: Customer[] = [];
        let customers = get().customers;

        for (const row of rows) {
          if (row.status === "error") {
            continue;
          }
          const plan =
            planOptions.find((item) => item.name === row.planName) ??
            planOptions[0];
          const customer: Customer = {
            id: id(),
            customerNumber: nextCustomerNumber([...customers, ...created]),
            fullName: row.name,
            customerType: row.planName.startsWith("Bisnis")
              ? "business"
              : "residential",
            status: "active",
            branchId: row.branchName === "Bandung" ? "br-bdg" : row.branchName === "Surabaya" ? "br-sby" : "br-jkt",
            branchName: row.branchName,
            planId: plan.id,
            planName: plan.name,
            monthlyFee: plan.price,
            phone: row.phone,
            email: "",
            nik: row.nik,
            address: "Alamat dari import",
            village: "-",
            district: "-",
            city: row.branchName,
            province: "-",
            postalCode: "-",
            salesName: "Import",
            dueDay: 10,
            registeredAt: today(),
            subscriptionStatus: "active",
            outstanding: 0,
            notes: row.message,
          };
          created.push(customer);
          customers = [...customers, customer];
          count += 1;
        }

        if (created.length > 0) {
          set((state) => ({
            customers: [...created, ...state.customers],
          }));
          useFoundationStore.getState().addAudit({
            action: "customer.imported",
            entityType: "import_batch",
            entityId: `IMP-${Date.now()}`,
            actor: actor ?? useAuthStore.getState().session?.name ?? "Customer Service",
            branch: "JKT-01",
            description: `${created.length} pelanggan diimport.`,
          });
        }

        return count;
      },

      resetCustomers: () => {
        set({
          customers: seedCustomers,
          segments: seedSegments,
          drafts: [],
          invoices: seedInvoices,
          tickets: seedTickets,
          services: seedServices,
        });
      },
    }),
    { name: "muranet-customers", skipHydration: true }
  )
);
