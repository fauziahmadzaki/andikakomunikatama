"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useBillingStore } from "@/features/billing/store/billing-store";
import { useBranchStore } from "@/features/branches/store/branch-store";
import { buildCustomerView } from "@/features/customers/data/view";
import type {
  AddressType,
  ContactType,
  CustomerAccount,
  CustomerAddress,
  CustomerContact,
  CustomerIdentity,
  CustomerType,
  IdentityType,
  RegistrationType,
} from "@/features/customers/data/types";
import { useCustomerStore } from "@/features/customers/store/customer-store";
import { usePlanProfileStore } from "@/features/plan-profiles/store/plan-profile-store";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription-store";
import { useTicketStore } from "@/features/tickets/store/ticket-store";
import { useUsersStore } from "@/features/users/store/users-store";

export type CustomerEditForm = {
  fullName: string;
  customerType: CustomerType;
  registrationType: RegistrationType;
  branchId: string;
  salesEmployeeId: string;
  notes: string;
};

export type AddressForm = {
  addressType: AddressType;
  addressLine: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  isPrimary: boolean;
};

export type ContactForm = {
  contactType: ContactType;
  value: string;
  isPrimary: boolean;
  isVerified: boolean;
};

export type IdentityForm = {
  identityType: IdentityType;
  identityNumber: string;
};

export type AccountForm = {
  email: string;
  phone: string;
  isActive: boolean;
};

const emptyAddress: AddressForm = {
  addressType: "home",
  addressLine: "",
  village: "",
  district: "",
  city: "",
  province: "",
  postalCode: "",
  latitude: "",
  longitude: "",
  isPrimary: false,
};

const emptyContact: ContactForm = {
  contactType: "whatsapp",
  value: "",
  isPrimary: false,
  isVerified: false,
};

const emptyIdentity: IdentityForm = {
  identityType: "ktp",
  identityNumber: "",
};

export function useCustomerDetail(id: string) {
  const customers = useCustomerStore((state) => state.customers);
  const addresses = useCustomerStore((state) => state.addresses);
  const contacts = useCustomerStore((state) => state.contacts);
  const identities = useCustomerStore((state) => state.identities);
  const statusHistory = useCustomerStore((state) => state.statusHistory);
  const accounts = useCustomerStore((state) => state.accounts);
  const updateCustomer = useCustomerStore((state) => state.updateCustomer);
  const setStatus = useCustomerStore((state) => state.setStatus);
  const addAddress = useCustomerStore((state) => state.addAddress);
  const updateAddress = useCustomerStore((state) => state.updateAddress);
  const removeAddress = useCustomerStore((state) => state.removeAddress);
  const addContact = useCustomerStore((state) => state.addContact);
  const updateContact = useCustomerStore((state) => state.updateContact);
  const removeContact = useCustomerStore((state) => state.removeContact);
  const addIdentity = useCustomerStore((state) => state.addIdentity);
  const updateIdentity = useCustomerStore((state) => state.updateIdentity);
  const removeIdentity = useCustomerStore((state) => state.removeIdentity);
  const upsertAccount = useCustomerStore((state) => state.upsertAccount);
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const services = useSubscriptionStore((state) => state.services);
  const invoices = useBillingStore((state) => state.invoices);
  const tickets = useTicketStore((state) => state.tickets);
  const packages = usePlanProfileStore((state) => state.profiles);
  const branches = useBranchStore((state) => state.branches);
  const employees = useUsersStore((state) => state.employees);

  const customer = customers.find((item) => item.id === id);
  const subscription =
    subscriptions.find(
      (item) => item.customerId === id && item.status !== "terminated"
    ) ?? subscriptions.find((item) => item.customerId === id);
  const customerAddresses = addresses
    .filter((address) => address.customerId === id)
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  const customerContacts = contacts
    .filter((contact) => contact.customerId === id)
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  const customerIdentities = identities.filter(
    (identity) => identity.customerId === id
  );
  const customerHistory = [...statusHistory]
    .filter((item) => item.customerId === id)
    .sort((a, b) => b.changedAt.localeCompare(a.changedAt));
  const account = accounts.find((item) => item.customerId === id);
  const customerInvoices = invoices.filter(
    (invoice) => invoice.customerId === id
  );
  const customerTickets = tickets.filter((ticket) => ticket.customerId === id);
  const customerServices = services.filter(
    (service) => service.subscriptionId === subscription?.id
  );
  const outstanding = customerInvoices
    .filter((invoice) => invoice.status !== "void")
    .reduce(
      (total, invoice) => total + (invoice.total - invoice.paidAmount),
      0
    );
  const mrr = subscriptions
    .filter((item) => item.customerId === id && item.status === "active")
    .reduce((total, item) => total + item.priceSnapshot, 0);
  const view = customer
    ? buildCustomerView({
        customer,
        branches,
        employees,
        addresses,
        contacts,
        identities,
        account,
        subscription,
        planName:
          packages.find((item) => item.id === subscription?.planId)?.name ??
          "-",
        outstanding,
        mrr,
      })
    : undefined;

  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState<CustomerEditForm>({
    fullName: customer?.fullName ?? "",
    customerType: customer?.customerType ?? "residential",
    registrationType: customer?.registrationType ?? "existing",
    branchId: customer?.branchId ?? "br-jkt",
    salesEmployeeId: customer?.salesEmployeeId ?? "",
    notes: customer?.notes ?? "",
  });

  const [addressOpen, setAddressOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddress);
  const [contactOpen, setContactOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState<ContactForm>(emptyContact);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [editingIdentityId, setEditingIdentityId] = useState<string | null>(null);
  const [identityForm, setIdentityForm] = useState<IdentityForm>(emptyIdentity);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountForm, setAccountForm] = useState<AccountForm>({
    email: account?.email ?? "",
    phone: account?.phone ?? "",
    isActive: account?.isActive ?? true,
  });
  const [pendingDelete, setPendingDelete] = useState<{
    type: "address" | "contact" | "identity";
    id: string;
  } | null>(null);

  function openEdit() {
    if (customer) {
      setForm({
        fullName: customer.fullName,
        customerType: customer.customerType,
        registrationType: customer.registrationType ?? "existing",
        branchId: customer.branchId,
        salesEmployeeId: customer.salesEmployeeId ?? "",
        notes: customer.notes,
      });
    }
    setEditOpen(true);
  }

  function saveEdit() {
    if (!customer) {
      return;
    }
    if (!form.fullName.trim()) {
      toast.error("Nama pelanggan wajib diisi.");
      return;
    }
    updateCustomer(customer.id, {
      fullName: form.fullName,
      customerType: form.customerType,
      registrationType: form.registrationType,
      branchId: form.branchId,
      salesEmployeeId: form.salesEmployeeId || undefined,
      notes: form.notes,
    });
    toast.success("Data pelanggan diperbarui.");
    setEditOpen(false);
  }

  function confirmToggle() {
    if (!customer) {
      return;
    }
    const next = customer.status === "active" ? "inactive" : "active";
    setStatus(
      customer.id,
      next,
      next === "active"
        ? "Pelanggan diaktifkan kembali."
        : "Pelanggan dinonaktifkan."
    );
    toast.success(
      next === "active" ? "Pelanggan diaktifkan." : "Pelanggan dinonaktifkan."
    );
    setConfirmOpen(false);
  }

  function openCreateAddress() {
    setEditingAddressId(null);
    setAddressForm(emptyAddress);
    setAddressOpen(true);
  }

  function openEditAddress(address: CustomerAddress) {
    setEditingAddressId(address.id);
    setAddressForm({
      addressType: address.addressType,
      addressLine: address.addressLine,
      village: address.village,
      district: address.district,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      latitude: address.latitude?.toString() ?? "",
      longitude: address.longitude?.toString() ?? "",
      isPrimary: address.isPrimary,
    });
    setAddressOpen(true);
  }

  function saveAddress() {
    if (!customer) {
      return;
    }
    if (!addressForm.addressLine.trim() || !addressForm.city.trim()) {
      toast.error("Alamat dan kota wajib diisi.");
      return;
    }
    const payload = {
      customerId: customer.id,
      addressType: addressForm.addressType,
      addressLine: addressForm.addressLine,
      village: addressForm.village,
      district: addressForm.district,
      city: addressForm.city,
      province: addressForm.province,
      postalCode: addressForm.postalCode,
      latitude: addressForm.latitude ? Number(addressForm.latitude) : undefined,
      longitude: addressForm.longitude
        ? Number(addressForm.longitude)
        : undefined,
      isPrimary: addressForm.isPrimary,
    };
    if (editingAddressId) {
      updateAddress(editingAddressId, payload);
      toast.success("Alamat diperbarui.");
    } else {
      addAddress(payload);
      toast.success("Alamat ditambahkan.");
    }
    setAddressOpen(false);
  }

  function requestDelete(type: "address" | "contact" | "identity", id: string) {
    setPendingDelete({ type, id });
  }

  function confirmDelete() {
    if (!pendingDelete) {
      return;
    }
    if (pendingDelete.type === "address") {
      removeAddress(pendingDelete.id);
      toast.success("Alamat dihapus.");
    } else if (pendingDelete.type === "contact") {
      removeContact(pendingDelete.id);
      toast.success("Kontak dihapus.");
    } else {
      removeIdentity(pendingDelete.id);
      toast.success("Identitas dihapus.");
    }
    setPendingDelete(null);
  }

  function openCreateContact() {
    setEditingContactId(null);
    setContactForm(emptyContact);
    setContactOpen(true);
  }

  function openEditContact(contact: CustomerContact) {
    setEditingContactId(contact.id);
    setContactForm({
      contactType: contact.contactType,
      value: contact.value,
      isPrimary: contact.isPrimary,
      isVerified: contact.isVerified,
    });
    setContactOpen(true);
  }

  function saveContact() {
    if (!customer) {
      return;
    }
    if (!contactForm.value.trim()) {
      toast.error("Nilai kontak wajib diisi.");
      return;
    }
    const payload = { customerId: customer.id, ...contactForm };
    if (editingContactId) {
      updateContact(editingContactId, payload);
      toast.success("Kontak diperbarui.");
    } else {
      addContact(payload);
      toast.success("Kontak ditambahkan.");
    }
    setContactOpen(false);
  }

  function openCreateIdentity() {
    setEditingIdentityId(null);
    setIdentityForm(emptyIdentity);
    setIdentityOpen(true);
  }

  function openEditIdentity(identity: CustomerIdentity) {
    setEditingIdentityId(identity.id);
    setIdentityForm({
      identityType: identity.identityType,
      identityNumber: identity.identityNumber,
    });
    setIdentityOpen(true);
  }

  function saveIdentity() {
    if (!customer) {
      return;
    }
    if (!identityForm.identityNumber.trim()) {
      toast.error("Nomor identitas wajib diisi.");
      return;
    }
    const payload = { customerId: customer.id, ...identityForm };
    if (editingIdentityId) {
      updateIdentity(editingIdentityId, payload);
      toast.success("Identitas diperbarui.");
    } else {
      addIdentity(payload);
      toast.success("Identitas ditambahkan.");
    }
    setIdentityOpen(false);
  }

  function openAccount() {
    setAccountForm({
      email: account?.email ?? view?.primaryEmail ?? "",
      phone: account?.phone ?? view?.primaryPhone ?? "",
      isActive: account?.isActive ?? true,
    });
    setAccountOpen(true);
  }

  function saveAccount() {
    if (!customer) {
      return;
    }
    upsertAccount({
      customerId: customer.id,
      email: accountForm.email,
      phone: accountForm.phone,
      isActive: accountForm.isActive,
      lastLoginAt: account?.lastLoginAt,
    });
    toast.success("Akun portal diperbarui.");
    setAccountOpen(false);
  }

  return {
    customer: view,
    subscription,
    customerInvoices,
    customerTickets,
    customerServices,
    addresses: customerAddresses,
    contacts: customerContacts,
    identities: customerIdentities,
    statusHistory: customerHistory,
    account,
    branches,
    employees,
    editOpen,
    setEditOpen,
    openEdit,
    confirmOpen,
    setConfirmOpen,
    form,
    setForm,
    saveEdit,
    confirmToggle,
    addressOpen,
    setAddressOpen,
    editingAddressId,
    addressForm,
    setAddressForm,
    openCreateAddress,
    openEditAddress,
    saveAddress,
    requestDelete,
    pendingDelete,
    setPendingDelete,
    confirmDelete,
    contactOpen,
    setContactOpen,
    editingContactId,
    contactForm,
    setContactForm,
    openCreateContact,
    openEditContact,
    saveContact,
    identityOpen,
    setIdentityOpen,
    editingIdentityId,
    identityForm,
    setIdentityForm,
    openCreateIdentity,
    openEditIdentity,
    saveIdentity,
    accountOpen,
    setAccountOpen,
    accountForm,
    setAccountForm,
    openAccount,
    saveAccount,
  };
}

export type CustomerAccountForm = AccountForm;
export type CustomerAddressForm = AddressForm;
export type CustomerContactForm = ContactForm;
export type CustomerIdentityForm = IdentityForm;
export type { CustomerAccount };
