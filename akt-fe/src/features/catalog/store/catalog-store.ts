import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateUUID } from "@/lib/uuid";

import { useAuditStore } from "@/features/audit/store/audit-store";
import {
  seedDiscountScopes,
  seedDiscounts,
  seedPlanBranches,
  seedPlanPrices,
  seedPlans,
} from "../data/seed";
import type {
  Discount,
  DiscountScope,
  Plan,
  PlanBranch,
  PlanPrice,
} from "../data/types";

type NewPlan = Omit<Plan, "id" | "createdAt"> & { branchIds: string[] };
type NewDiscount = Omit<Discount, "id"> & {
  scopes: Array<Omit<DiscountScope, "id" | "discountId">>;
};
type PlanPatch = Partial<Plan> & { branchIds?: string[] };
type DiscountPatch = Partial<Discount> & {
  scopes?: Array<Omit<DiscountScope, "id" | "discountId">>;
};

type CatalogState = {
  plans: Plan[];
  planBranches: PlanBranch[];
  planPrices: PlanPrice[];
  discounts: Discount[];
  discountScopes: DiscountScope[];
  addPlan: (
    input: NewPlan,
    initialPrice: { price: number; isTaxable: boolean; effectiveFrom: string },
    actor?: string
  ) => void;
  updatePlan: (id: string, patch: PlanPatch, actor?: string) => void;
  togglePlan: (id: string, actor?: string) => void;
  addPlanPrice: (
    planId: string,
    input: { price: number; isTaxable: boolean; effectiveFrom: string },
    actor?: string
  ) => void;
  addDiscount: (input: NewDiscount, actor?: string) => void;
  updateDiscount: (
    id: string,
    patch: DiscountPatch,
    actor?: string
  ) => void;
  toggleDiscount: (id: string, actor?: string) => void;
  resetCatalog: () => void;
};

function id() {
  return generateUUID();
}

function audit(
  action: string,
  entityId: string,
  description: string,
  actor = "Administrator"
) {
  useAuditStore.getState().addAudit({
    action,
    entityType: "catalog",
    entityId,
    actor,
    branch: "JKT-01",
    description,
  });
}

function scopeRows(
  discountId: string,
  scopes: Array<Omit<DiscountScope, "id" | "discountId">>
): DiscountScope[] {
  return scopes.map((scope) => ({
    ...scope,
    id: id(),
    discountId,
  }));
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      plans: seedPlans,
      planBranches: seedPlanBranches,
      planPrices: seedPlanPrices,
      discounts: seedDiscounts,
      discountScopes: seedDiscountScopes,

      addPlan: (input, initialPrice, actor = "Administrator") => {
        const { branchIds, ...planInput } = input;
        const plan: Plan = {
          ...planInput,
          id: id(),
          createdAt: new Date().toISOString().slice(0, 10),
        };
        const price: PlanPrice = {
          id: id(),
          planId: plan.id,
          price: initialPrice.price,
          isTaxable: initialPrice.isTaxable,
          effectiveFrom: initialPrice.effectiveFrom,
        };
        set((state) => ({
          plans: [plan, ...state.plans],
          planBranches: [
            ...branchIds.map((branchId) => ({ planId: plan.id, branchId })),
            ...state.planBranches,
          ],
          planPrices: [price, ...state.planPrices],
        }));
        audit("plan.created", plan.code, `Paket ${plan.name} dibuat.`, actor);
      },

      updatePlan: (planId, patch, actor = "Administrator") => {
        const { branchIds, ...planPatch } = patch;
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === planId ? { ...plan, ...planPatch } : plan
          ),
          planBranches: branchIds
            ? [
                ...branchIds.map((branchId) => ({ planId, branchId })),
                ...state.planBranches.filter((item) => item.planId !== planId),
              ]
            : state.planBranches,
        }));
        const plan = get().plans.find((item) => item.id === planId);
        audit(
          "plan.updated",
          plan?.code ?? planId,
          `Paket ${plan?.name ?? planId} diperbarui.`,
          actor
        );
      },

      togglePlan: (planId, actor = "Administrator") => {
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === planId ? { ...plan, isActive: !plan.isActive } : plan
          ),
        }));
        const plan = get().plans.find((item) => item.id === planId);
        audit(
          plan?.isActive ? "plan.activated" : "plan.deactivated",
          plan?.code ?? planId,
          `Status paket ${plan?.name ?? planId} diubah.`,
          actor
        );
      },

      addPlanPrice: (planId, input, actor = "Administrator") => {
        set((state) => {
          const previous = state.planPrices
            .filter((price) => price.planId === planId && !price.effectiveTo)
            .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
          const previousEnd = new Date(input.effectiveFrom);
          previousEnd.setDate(previousEnd.getDate() - 1);
          return {
            planPrices: [
              {
                id: id(),
                planId,
                price: input.price,
                isTaxable: input.isTaxable,
                effectiveFrom: input.effectiveFrom,
              },
              ...state.planPrices.map((price) =>
                previous && price.id === previous.id
                  ? {
                      ...price,
                      effectiveTo: previousEnd.toISOString().slice(0, 10),
                    }
                  : price
              ),
            ],
          };
        });
        const plan = get().plans.find((item) => item.id === planId);
        audit(
          "plan.price_changed",
          plan?.code ?? planId,
          `Harga paket ${plan?.name ?? planId} diperbarui.`,
          actor
        );
      },

      addDiscount: (input, actor = "Administrator") => {
        const { scopes, ...discountInput } = input;
        const discount: Discount = { ...discountInput, id: id() };
        set((state) => ({
          discounts: [discount, ...state.discounts],
          discountScopes: [
            ...scopeRows(discount.id, scopes),
            ...state.discountScopes,
          ],
        }));
        audit(
          "discount.created",
          discount.code,
          `Diskon ${discount.name} dibuat.`,
          actor
        );
      },

      updateDiscount: (discountId, patch, actor = "Administrator") => {
        const { scopes, ...discountPatch } = patch;
        set((state) => ({
          discounts: state.discounts.map((discount) =>
            discount.id === discountId
              ? { ...discount, ...discountPatch }
              : discount
          ),
          discountScopes: scopes
            ? [
                ...scopeRows(discountId, scopes),
                ...state.discountScopes.filter(
                  (scope) => scope.discountId !== discountId
                ),
              ]
            : state.discountScopes,
        }));
        const discount = get().discounts.find((item) => item.id === discountId);
        audit(
          "discount.updated",
          discount?.code ?? discountId,
          `Diskon ${discount?.name ?? discountId} diperbarui.`,
          actor
        );
      },

      toggleDiscount: (discountId, actor = "Administrator") => {
        set((state) => ({
          discounts: state.discounts.map((discount) =>
            discount.id === discountId
              ? { ...discount, isActive: !discount.isActive }
              : discount
          ),
        }));
        const discount = get().discounts.find((item) => item.id === discountId);
        audit(
          discount?.isActive ? "discount.activated" : "discount.deactivated",
          discount?.code ?? discountId,
          `Status diskon ${discount?.name ?? discountId} diubah.`,
          actor
        );
      },

      resetCatalog: () => {
        set({
          plans: seedPlans,
          planBranches: seedPlanBranches,
          planPrices: seedPlanPrices,
          discounts: seedDiscounts,
          discountScopes: seedDiscountScopes,
        });
      },
    }),
    { name: "muranet-catalog-v2", skipHydration: true }
  )
);
