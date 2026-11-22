"use client";

import { useMemo, useState } from "react";
import { generateUUID } from "@/lib/uuid";
import { toast } from "sonner";

import { useBranchStore } from "@/features/branches/store/branch-store";
import type {
  DiscountMethod,
  DiscountScopeType,
} from "@/features/catalog/data/types";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { useCustomerStore } from "@/features/customers/store/customer-store";
import { usePlanProfileStore } from "@/features/plan-profiles/store/plan-profile-store";

export type DiscountScopeForm = {
  key: string;
  scopeType: DiscountScopeType;
  branchId: string;
  planId: string;
  customerId: string;
};

export type DiscountForm = {
  code: string;
  name: string;
  method: DiscountMethod;
  value: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  scopes: DiscountScopeForm[];
};

function newScope(planId = ""): DiscountScopeForm {
  return {
    key: generateUUID(),
    scopeType: "all",
    branchId: "br-jkt",
    planId,
    customerId: "",
  };
}

function createEmptyForm(planId = ""): DiscountForm {
  return {
    code: "",
    name: "",
    method: "percentage",
    value: "",
    startsAt: new Date().toISOString().slice(0, 10),
    endsAt: new Date().toISOString().slice(0, 10),
    isActive: true,
    scopes: [newScope(planId)],
  };
}

export function useDiscountsPage() {
  const discounts = useCatalogStore((state) => state.discounts);
  const discountScopes = useCatalogStore((state) => state.discountScopes);
  const addDiscount = useCatalogStore((state) => state.addDiscount);
  const updateDiscount = useCatalogStore((state) => state.updateDiscount);
  const toggleDiscount = useCatalogStore((state) => state.toggleDiscount);
  const plans = usePlanProfileStore((state) => state.profiles);
  const branches = useBranchStore((state) => state.branches);
  const customers = useCustomerStore((state) => state.customers);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DiscountForm>(() =>
    createEmptyForm(plans[0]?.id)
  );
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      discounts.filter((discount) =>
        `${discount.code} ${discount.name}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [discounts, query]
  );

  function scopeLabel(discountId: string) {
    const scopes = discountScopes.filter(
      (scope) => scope.discountId === discountId
    );
    if (scopes.length === 0) {
      return "-";
    }
    return scopes
      .map((scope) => {
        if (scope.scopeType === "all") {
          return "Semua pelanggan";
        }
        if (scope.scopeType === "branch") {
          return `Cabang ${
            branches.find((branch) => branch.id === scope.branchId)?.name ?? "-"
          }`;
        }
        if (scope.scopeType === "plan") {
          return `Paket ${
            plans.find((plan) => plan.id === scope.planId)?.name ?? "-"
          }`;
        }
        if (scope.scopeType === "plan_branch") {
          return `Paket ${
            plans.find((plan) => plan.id === scope.planId)?.name ?? "-"
          } + cabang ${
            branches.find((branch) => branch.id === scope.branchId)?.name ?? "-"
          }`;
        }
        return `Pelanggan ${
          customers.find((customer) => customer.id === scope.customerId)
            ?.fullName ?? "-"
        }`;
      })
      .join(", ");
  }

  function openCreate() {
    setEditingId(null);
    setForm(createEmptyForm(plans[0]?.id));
    setOpen(true);
  }

  function openEdit(id: string) {
    const discount = discounts.find((item) => item.id === id);
    if (!discount) {
      return;
    }
    const scopes = discountScopes
      .filter((scope) => scope.discountId === id)
      .map((scope) => ({
        key: scope.id,
        scopeType: scope.scopeType,
        branchId: scope.branchId ?? "br-jkt",
        planId: scope.planId ?? plans[0]?.id ?? "",
        customerId: scope.customerId ?? "",
      }));
    setEditingId(id);
    setForm({
      code: discount.code,
      name: discount.name,
      method: discount.method,
      value: String(discount.value),
      startsAt: discount.startsAt,
      endsAt: discount.endsAt,
      isActive: discount.isActive,
      scopes: scopes.length > 0 ? scopes : [newScope()],
    });
    setOpen(true);
  }

  function addScope() {
    setForm((current) => ({
      ...current,
      scopes: [...current.scopes, newScope(plans[0]?.id)],
    }));
  }

  function removeScope(key: string) {
    setForm((current) => ({
      ...current,
      scopes:
        current.scopes.length > 1
          ? current.scopes.filter((scope) => scope.key !== key)
          : current.scopes,
    }));
  }

  function updateScope(
    key: string,
    patch: Partial<Omit<DiscountScopeForm, "key">>
  ) {
    setForm((current) => ({
      ...current,
      scopes: current.scopes.map((scope) =>
        scope.key === key ? { ...scope, ...patch } : scope
      ),
    }));
  }

  function save() {
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("Kode dan nama diskon wajib diisi.");
      return;
    }
    const value = Number(form.value);
    if (!Number.isFinite(value) || value < 0) {
      toast.error("Nilai diskon tidak valid.");
      return;
    }
    if (form.method === "percentage" && value > 100) {
      toast.error("Persentase diskon maksimal 100.");
      return;
    }
    for (const scope of form.scopes) {
      if (
        (scope.scopeType === "branch" ||
          scope.scopeType === "plan_branch") &&
        !scope.branchId
      ) {
        toast.error("Cabang scope wajib dipilih.");
        return;
      }
      if (
        (scope.scopeType === "plan" || scope.scopeType === "plan_branch") &&
        !scope.planId
      ) {
        toast.error("Paket scope wajib dipilih.");
        return;
      }
      if (scope.scopeType === "customer" && !scope.customerId) {
        toast.error("Pelanggan scope wajib dipilih.");
        return;
      }
    }

    const payload = {
      code: form.code.toUpperCase(),
      name: form.name,
      method: form.method,
      value,
      startsAt: form.startsAt,
      endsAt: form.endsAt,
      isActive: form.isActive,
      scopes: form.scopes.map((scope) => ({
        scopeType: scope.scopeType,
        branchId:
          scope.scopeType === "branch" || scope.scopeType === "plan_branch"
            ? scope.branchId
            : undefined,
        planId:
          scope.scopeType === "plan" || scope.scopeType === "plan_branch"
            ? scope.planId
            : undefined,
        customerId:
          scope.scopeType === "customer" ? scope.customerId : undefined,
      })),
    };

    if (editingId) {
      updateDiscount(editingId, payload);
      toast.success("Diskon diperbarui.");
    } else {
      addDiscount(payload);
      toast.success("Diskon dibuat.");
    }
    setOpen(false);
  }

  function confirmToggle() {
    if (!confirmId) {
      return;
    }
    const discount = discounts.find((item) => item.id === confirmId);
    toggleDiscount(confirmId);
    toast.success(
      discount?.isActive ? "Diskon dinonaktifkan." : "Diskon diaktifkan."
    );
    setConfirmId(null);
  }

  return {
    discounts: filtered,
    plans,
    branches,
    customers,
    query,
    setQuery,
    open,
    setOpen,
    form,
    setForm,
    openCreate,
    openEdit,
    save,
    addScope,
    removeScope,
    updateScope,
    scopeLabel,
    confirmId,
    setConfirmId,
    confirmToggle,
    editingId,
  };
}
