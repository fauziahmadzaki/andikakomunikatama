export type CompanyProfile = {
  name: string;
  legalName: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string;
  invoicePrefix: string;
  logoUrl: string | null;
  bhpRate: number;
  usoRate: number;
  ispFeeRate: number;
};

export type Branch = {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  isHeadOffice: boolean;
  isActive: boolean;
  customerCount: number;
};

export type SettingFieldType = "text" | "number" | "boolean" | "select";

export type SettingField = {
  key: string;
  label: string;
  description: string;
  type: SettingFieldType;
  value: string | number | boolean;
  options?: string[];
  suffix?: string;
};

export type SettingGroup = {
  id: string;
  title: string;
  description: string;
  fields: SettingField[];
};

export type NumberSequence = {
  id: string;
  key: string;
  label: string;
  prefix: string;
  nextNumber: number;
  padding: number;
  resetPolicy: "yearly" | "monthly" | "never";
};

export type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actor: string;
  branch: string;
  description: string;
  createdAt: string;
};
