export type ConnectionType = "pppoe" | "hotspot" | "static" | "iptv" | "other";
export type BillingType = "monthly" | "non_monthly";
export type DiscountMethod = "percentage" | "fixed";
export type DiscountScopeType =
  | "all"
  | "branch"
  | "plan"
  | "plan_branch"
  | "customer";

export type Plan = {
  id: string;
  code: string;
  name: string;
  description: string;
  connectionType: ConnectionType;
  billingType: BillingType;
  isActive: boolean;
  createdAt: string;
};

export type PlanBranch = {
  planId: string;
  branchId: string;
};

export type PlanPrice = {
  id: string;
  planId: string;
  price: number;
  isTaxable: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
};

export type Discount = {
  id: string;
  code: string;
  name: string;
  method: DiscountMethod;
  value: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

export type DiscountScope = {
  id: string;
  discountId: string;
  scopeType: DiscountScopeType;
  branchId?: string;
  planId?: string;
  customerId?: string;
};

export type PricingInput = {
  price: number;
  registrationDate: string;
  prorate: boolean;
  taxEnabled: boolean;
  discountMethod: DiscountMethod | "none";
  discountValue: number;
  taxRate: number;
};

export type PricingResult = {
  basePrice: number;
  activeDays: number;
  daysInMonth: number;
  proratedPrice: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
};
