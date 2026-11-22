export type CustomerStatus = "active" | "suspended" | "inactive" | "draft";
export type CustomerType = "residential" | "business";
export type RegistrationType = "new" | "existing" | "survey";
export type AddressType = "home" | "office" | "installation";
export type ContactType = "phone" | "whatsapp" | "email";
export type IdentityType = "ktp" | "sim" | "ktm" | "npwp" | "passport";

export type Customer = {
  id: string;
  branchId: string;
  salesEmployeeId?: string;
  customerNumber: string;
  fullName: string;
  customerType: CustomerType;
  registrationType: RegistrationType;
  status: CustomerStatus;
  registeredAt: string;
  notes: string;
};

export type CustomerAddress = {
  id: string;
  customerId: string;
  addressType: AddressType;
  addressLine: string;
  village: string;
  district: string;
  city: string;
  province: string;
  villageId?: string;
  districtId?: string;
  regencyId?: string;
  provinceId?: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  isPrimary: boolean;
};

export type CustomerContact = {
  id: string;
  customerId: string;
  contactType: ContactType;
  value: string;
  isPrimary: boolean;
  isVerified: boolean;
};

export type CustomerIdentity = {
  id: string;
  customerId: string;
  identityType: IdentityType;
  identityNumber: string;
  fileId?: string;
  fileName?: string;
};

export type CustomerStatusHistory = {
  id: string;
  customerId: string;
  status: CustomerStatus;
  reason: string;
  changedBy: string;
  changedAt: string;
};

export type CustomerAccount = {
  id: string;
  customerId: string;
  email: string;
  phone: string;
  isActive: boolean;
  lastLoginAt?: string;
};

export type CustomerView = Customer & {
  branchName: string;
  salesName: string;
  primaryAddress?: CustomerAddress;
  primaryPhone: string;
  secondaryPhone: string;
  primaryEmail: string;
  primaryIdentity?: CustomerIdentity;
  planName: string;
  monthlyFee: number;
  dueDay: number;
  outstanding: number;
  mrr: number;
  subscriptionStatus: "active" | "suspended" | "terminated" | "draft";
};

export type PlanOption = {
  id: string;
  name: string;
  price: number;
  connectionType: string;
};

export type CustomerDraft = {
  id: string;
  data: Partial<Customer>;
  step: number;
  updatedAt: string;
};

export type ImportRow = {
  row: number;
  name: string;
  phone: string;
  nik: string;
  branchName: string;
  planName: string;
  status: "valid" | "warning" | "error";
  message: string;
};
