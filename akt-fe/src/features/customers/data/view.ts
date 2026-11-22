import type { Branch } from "@/features/branches/data/branches";
import type { Subscription } from "@/features/subscriptions/data/types";
import type { Employee } from "@/features/users/data/employees";
import type {
  Customer,
  CustomerAccount,
  CustomerAddress,
  CustomerContact,
  CustomerIdentity,
  CustomerView,
} from "./types";

export function buildCustomerView({
  customer,
  branches,
  employees,
  addresses,
  contacts,
  identities,
  account,
  subscription,
  planName,
  outstanding,
  mrr,
}: {
  customer: Customer;
  branches: Branch[];
  employees: Employee[];
  addresses: CustomerAddress[];
  contacts: CustomerContact[];
  identities: CustomerIdentity[];
  account?: CustomerAccount;
  subscription?: Subscription;
  planName?: string;
  outstanding: number;
  mrr: number;
}): CustomerView {
  const customerAddresses = addresses.filter(
    (address) => address.customerId === customer.id
  );
  const customerContacts = contacts.filter(
    (contact) => contact.customerId === customer.id
  );
  const customerIdentities = identities.filter(
    (identity) => identity.customerId === customer.id
  );
  const primaryAddress =
    customerAddresses.find((address) => address.isPrimary) ??
    customerAddresses[0];
  const primaryPhone =
    customerContacts.find(
      (contact) =>
        contact.isPrimary &&
        (contact.contactType === "phone" ||
          contact.contactType === "whatsapp")
    )?.value ??
    customerContacts.find(
      (contact) =>
        contact.contactType === "phone" || contact.contactType === "whatsapp"
    )?.value ??
    account?.phone ??
    "-";
  const secondaryPhone =
    customerContacts
      .filter(
        (contact) =>
          (contact.contactType === "phone" ||
            contact.contactType === "whatsapp") &&
          contact.value !== primaryPhone
      )
      .map((contact) => contact.value)[0] ?? "";
  const primaryEmail =
    customerContacts.find(
      (contact) => contact.contactType === "email" && contact.isPrimary
    )?.value ??
    customerContacts.find((contact) => contact.contactType === "email")?.value ??
    account?.email ??
    "";
  const primaryIdentity =
    customerIdentities.find((identity) => identity.identityType === "ktp") ??
    customerIdentities[0];

  return {
    ...customer,
    branchName:
      branches.find((branch) => branch.id === customer.branchId)?.name ??
      "Tanpa cabang",
    salesName:
      employees.find((employee) => employee.id === customer.salesEmployeeId)
        ?.fullName ?? "-",
    primaryAddress,
    primaryPhone,
    secondaryPhone,
    primaryEmail,
    primaryIdentity,
    planName: planName ?? subscription?.planId ?? "-",
    monthlyFee: subscription?.priceSnapshot ?? 0,
    dueDay: subscription?.dueDay ?? 0,
    outstanding,
    mrr,
    subscriptionStatus: subscription?.status ?? "draft",
  };
}
