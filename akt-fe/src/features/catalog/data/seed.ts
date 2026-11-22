import type {
  Discount,
  DiscountScope,
  Plan,
  PlanBranch,
  PlanPrice,
} from "./types";

export const seedPlans: Plan[] = [
  {
    id: "plan-home-20",
    code: "HOME-20",
    name: "Home 20 Mbps",
    description: "Paket internet rumah 20 Mbps untuk kebutuhan harian.",
    connectionType: "pppoe",
    billingType: "monthly",
    isActive: true,
    createdAt: "2025-01-01",
  },
  {
    id: "plan-home-30",
    code: "HOME-30",
    name: "Home 30 Mbps",
    description: "Paket internet rumah 30 Mbps untuk keluarga.",
    connectionType: "pppoe",
    billingType: "monthly",
    isActive: true,
    createdAt: "2025-01-01",
  },
  {
    id: "plan-home-50",
    code: "HOME-50",
    name: "Home 50 Mbps",
    description: "Paket internet rumah 50 Mbps untuk streaming dan WFH.",
    connectionType: "pppoe",
    billingType: "monthly",
    isActive: true,
    createdAt: "2025-01-01",
  },
  {
    id: "plan-biz-100",
    code: "BIZ-100",
    name: "Bisnis 100 Mbps",
    description: "Paket bisnis dengan IP statis dan SLA.",
    connectionType: "static",
    billingType: "monthly",
    isActive: true,
    createdAt: "2025-01-01",
  },
  {
    id: "plan-biz-200",
    code: "BIZ-200",
    name: "Bisnis 200 Mbps",
    description: "Paket bisnis 200 Mbps untuk kebutuhan korporat.",
    connectionType: "static",
    billingType: "monthly",
    isActive: true,
    createdAt: "2025-01-01",
  },
  {
    id: "plan-hotspot",
    code: "HOTSPOT-1",
    name: "Hotspot Harian",
    description: "Paket hotspot non-bulanan.",
    connectionType: "hotspot",
    billingType: "non_monthly",
    isActive: false,
    createdAt: "2025-01-01",
  },
];

export const seedPlanBranches: PlanBranch[] = [
  { planId: "plan-home-20", branchId: "br-jkt" },
  { planId: "plan-home-20", branchId: "br-bdg" },
  { planId: "plan-home-20", branchId: "br-sby" },
  { planId: "plan-home-30", branchId: "br-jkt" },
  { planId: "plan-home-30", branchId: "br-bdg" },
  { planId: "plan-home-30", branchId: "br-sby" },
  { planId: "plan-home-50", branchId: "br-jkt" },
  { planId: "plan-home-50", branchId: "br-bdg" },
  { planId: "plan-biz-100", branchId: "br-jkt" },
  { planId: "plan-biz-100", branchId: "br-bdg" },
  { planId: "plan-biz-200", branchId: "br-jkt" },
  { planId: "plan-biz-200", branchId: "br-bdg" },
  { planId: "plan-hotspot", branchId: "br-jkt" },
];

export const seedPlanPrices: PlanPrice[] = [
  {
    id: "price-20-old",
    planId: "plan-home-20",
    price: 180000,
    isTaxable: true,
    effectiveFrom: "2025-01-01",
    effectiveTo: "2025-12-31",
  },
  {
    id: "price-20-current",
    planId: "plan-home-20",
    price: 200000,
    isTaxable: true,
    effectiveFrom: "2026-01-01",
  },
  {
    id: "price-30-old",
    planId: "plan-home-30",
    price: 230000,
    isTaxable: true,
    effectiveFrom: "2025-01-01",
    effectiveTo: "2025-12-31",
  },
  {
    id: "price-30-current",
    planId: "plan-home-30",
    price: 250000,
    isTaxable: true,
    effectiveFrom: "2026-01-01",
  },
  {
    id: "price-50",
    planId: "plan-home-50",
    price: 350000,
    isTaxable: true,
    effectiveFrom: "2026-01-01",
  },
  {
    id: "price-biz-100",
    planId: "plan-biz-100",
    price: 750000,
    isTaxable: true,
    effectiveFrom: "2026-01-01",
  },
  {
    id: "price-biz-200",
    planId: "plan-biz-200",
    price: 1200000,
    isTaxable: true,
    effectiveFrom: "2026-01-01",
  },
  {
    id: "price-hotspot",
    planId: "plan-hotspot",
    price: 10000,
    isTaxable: false,
    effectiveFrom: "2026-01-01",
  },
];

export const seedDiscounts: Discount[] = [
  {
    id: "disc-newyear",
    code: "NEWYEAR10",
    name: "Promo Tahun Baru",
    method: "percentage",
    value: 10,
    startsAt: "2026-01-01",
    endsAt: "2026-01-31",
    isActive: false,
  },
  {
    id: "disc-jkt-branch",
    code: "JKT-BRANCH",
    name: "Diskon Cabang Jakarta",
    method: "fixed",
    value: 25000,
    startsAt: "2026-01-01",
    endsAt: "2026-12-31",
    isActive: true,
  },
  {
    id: "disc-home30",
    code: "HOME10-PROMO",
    name: "Promo Home 10",
    method: "percentage",
    value: 15,
    startsAt: "2026-01-01",
    endsAt: "2026-12-31",
    isActive: true,
  },
  {
    id: "disc-biz-anniv",
    code: "HOTSPOT-PROMO",
    name: "Promo Hotspot",
    method: "fixed",
    value: 10000,
    startsAt: "2026-02-01",
    endsAt: "2026-02-28",
    isActive: true,
  },
];

export const seedDiscountScopes: DiscountScope[] = [
  {
    id: "scope-newyear",
    discountId: "disc-newyear",
    scopeType: "all",
  },
  {
    id: "scope-jkt-branch",
    discountId: "disc-jkt-branch",
    scopeType: "branch",
    branchId: "br-jkt",
  },
  {
    id: "scope-home30",
    discountId: "disc-home30",
    scopeType: "plan",
    planId: "profile-home-10",
  },
  {
    id: "scope-biz-anniv",
    discountId: "disc-biz-anniv",
    scopeType: "plan",
    planId: "profile-hotspot-5",
  },
];

export function currentPlanPrice(planId: string, prices: PlanPrice[]) {
  return [...prices]
    .filter((price) => price.planId === planId)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
}
