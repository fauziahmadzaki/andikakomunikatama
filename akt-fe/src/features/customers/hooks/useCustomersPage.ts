"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useBillingStore } from "@/features/billing/store/billing-store";
import { useBranchStore } from "@/features/branches/store/branch-store";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { formatRupiah } from "@/lib/format";
import { buildCustomerView } from "@/features/customers/data/view";
import type { CustomerView } from "@/features/customers/data/types";
import { useCustomerStore } from "@/features/customers/store/customer-store";
import { usePlanProfileStore } from "@/features/plan-profiles/store/plan-profile-store";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription-store";
import { hasPermission } from "@/features/users/data/permissions";
import { useUsersStore } from "@/features/users/store/users-store";

const PAGE_SIZE = 8;

export type CustomerBulkAction =
  | "activate"
  | "isolate"
  | "deactivate"
  | "migrate"
  | "delete";

export function useCustomersPage() {
  const router = useRouter();
  const customers = useCustomerStore((state) => state.customers);
  const fetchCustomers = useCustomerStore((state) => state.fetchCustomers);
  const addresses = useCustomerStore((state) => state.addresses);
  const contacts = useCustomerStore((state) => state.contacts);
  const identities = useCustomerStore((state) => state.identities);
  const accounts = useCustomerStore((state) => state.accounts);
  const setCustomerStatus = useCustomerStore((state) => state.setStatus);
  const deleteCustomers = useCustomerStore((state) => state.deleteCustomers);
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const activateSubscription = useSubscriptionStore((state) => state.activate);
  const suspendSubscription = useSubscriptionStore((state) => state.suspend);
  const reactivateSubscription = useSubscriptionStore(
    (state) => state.reactivate
  );
  const terminateSubscription = useSubscriptionStore((state) => state.terminate);
  const changeSubscriptionPlan = useSubscriptionStore(
    (state) => state.changePlan
  );
  const invoices = useBillingStore((state) => state.invoices);
  const packages = usePlanProfileStore((state) => state.profiles);
  const branches = useBranchStore((state) => state.branches);
  const fetchBranches = useBranchStore((state) => state.fetchBranches);
  const employees = useUsersStore((state) => state.employees);
  const session = useAuthStore((state) => state.session);
  const rolePermissions = useUsersStore((state) => state.rolePermissions);
  const can = (code: string) =>
    session ? hasPermission(session.role, code, rolePermissions) : false;
  const canActivate = can("subscription.activate");
  const canIsolate = can("subscription.suspend");
  const canDeactivate = can("customer.deactivate");
  const canMigrate = can("subscription.migrate");
  const canDelete = can("customer.deactivate");
  const [query, setQueryState] = useState("");
  const [branch, setBranchState] = useState("all");
  const [statusFilter, setStatusFilterState] = useState("all");
  const [page, setPage] = useState(1);
  const [confirmCustomer, setConfirmCustomer] = useState<CustomerView | null>(
    null
  );
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<CustomerBulkAction | null>(null);
  const [bulkReason, setBulkReason] = useState("");
  const [bulkTargetPlanId, setBulkTargetPlanId] = useState("");

  useEffect(() => {
    fetchCustomers();
    fetchBranches();
  }, [fetchBranches, fetchCustomers]);

  function setQuery(value: string) {
    setQueryState(value);
    setSelectedKeys(new Set());
  }

  function setBranch(value: string) {
    setBranchState(value);
    setSelectedKeys(new Set());
  }

  function setStatusFilter(value: string) {
    setStatusFilterState(value);
    setSelectedKeys(new Set());
  }

  const views = useMemo<CustomerView[]>(
    () =>
      customers.map((customer) => {
        const subscription =
          subscriptions.find(
            (item) =>
              item.customerId === customer.id && item.status !== "terminated"
          ) ?? subscriptions.find((item) => item.customerId === customer.id);
        const outstanding = invoices
          .filter(
            (invoice) =>
              invoice.customerId === customer.id && invoice.status !== "void"
          )
          .reduce(
            (total, invoice) => total + (invoice.total - invoice.paidAmount),
            0
          );
        const mrr = subscriptions
          .filter(
            (item) =>
              item.customerId === customer.id && item.status === "active"
          )
          .reduce((total, item) => total + item.priceSnapshot, 0);
        return buildCustomerView({
          customer,
          branches,
          employees,
          addresses,
          contacts,
          identities,
          account: accounts.find((account) => account.customerId === customer.id),
          subscription,
          planName:
            packages.find((item) => item.id === subscription?.planId)?.name ??
            "-",
          outstanding,
          mrr,
        });
      }),
    [
      accounts,
      addresses,
      branches,
      contacts,
      customers,
      employees,
      identities,
      invoices,
      packages,
      subscriptions,
    ]
  );

  const selectedCustomers = useMemo(
    () => views.filter((customer) => selectedKeys.has(customer.id)),
    [selectedKeys, views]
  );
  const selectedCount = selectedCustomers.length;
  const bulkTargetOptions = useMemo(
    () =>
      packages
        .filter((item) => item.isActive)
        .map((item) => ({
          value: item.id,
          label: `${item.name} — ${formatRupiah(item.price)}`,
        })),
    [packages]
  );

  const filtered = useMemo(
    () =>
      views.filter((customer) => {
        const matchesQuery =
          !query ||
          `${customer.fullName} ${customer.customerNumber} ${customer.primaryPhone} ${customer.primaryEmail}`
            .toLowerCase()
            .includes(query.toLowerCase());
        const matchesBranch = branch === "all" || customer.branchId === branch;
        const matchesStatus =
          statusFilter === "all" || customer.status === statusFilter;
        return matchesQuery && matchesBranch && matchesStatus;
      }),
    [branch, query, statusFilter, views]
  );

  const selectableIds = useMemo(
    () => filtered.map((customer) => customer.id),
    [filtered]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const stats = useMemo(
    () => ({
      total: views.length,
      active: views.filter((customer) => customer.status === "active").length,
      suspended: views.filter((customer) => customer.status === "suspended")
        .length,
      outstanding: views.reduce(
        (total, customer) => total + customer.outstanding,
        0
      ),
      mrr: views.reduce((total, customer) => total + customer.mrr, 0),
    }),
    [views]
  );

  function exportCsv() {
    const header = [
      "Nomor pelanggan",
      "Nama",
      "Telepon",
      "Cabang",
      "Paket",
      "Status",
      "Outstanding",
    ];
    const data = filtered.map((customer) => [
      customer.customerNumber,
      customer.fullName,
      customer.primaryPhone,
      customer.branchName,
      customer.planName,
      customer.status,
      String(customer.outstanding),
    ]);
    const csv = [header, ...data]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "pelanggan-muranet.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(`${filtered.length} pelanggan diexport.`);
  }

  async function confirmToggle() {
    if (!confirmCustomer) {
      return;
    }

    const isolating = confirmCustomer.status === "active";
    const nextStatus = isolating ? "suspended" : "active";
    const reason = isolating
      ? "Isolir pelanggan."
      : "Pelanggan diaktifkan kembali.";

    await setCustomerStatus(confirmCustomer.id, nextStatus, reason);
    const customerSubscriptions = subscriptions.filter(
      (subscription) => subscription.customerId === confirmCustomer.id
    );

    if (isolating) {
      customerSubscriptions
        .filter((subscription) => subscription.status === "active")
        .forEach((subscription) =>
          suspendSubscription(subscription.id, reason)
        );
      toast.success("Pelanggan diisolir.");
    } else {
      const subscription = customerSubscriptions.find(
        (item) => item.status !== "terminated"
      );
      if (subscription?.status === "suspended") {
        reactivateSubscription(subscription.id);
      } else if (subscription?.status === "draft") {
        activateSubscription(subscription.id);
      }
      toast.success("Pelanggan diaktifkan.");
    }

    setConfirmCustomer(null);
  }

  function startBulkAction(action: CustomerBulkAction) {
    setBulkAction(action);
    setBulkReason(action === "isolate" ? "Isolir massal." : "");
    if (action === "migrate") {
      setBulkTargetPlanId(
        packages.find((item) => item.isActive)?.id ?? ""
      );
    }
  }

  function closeBulkAction() {
    setBulkAction(null);
    setBulkReason("");
  }

  async function applyBulkAction() {
    if (!bulkAction || selectedCustomers.length === 0) {
      return;
    }

    const selected = selectedCustomers;

    if (bulkAction === "migrate") {
      const target = packages.find((item) => item.id === bulkTargetPlanId);
      if (!target) {
        toast.error("Pilih paket target terlebih dahulu.");
        return;
      }

      let migrated = 0;
      selected.forEach((customer) => {
        const subscription = subscriptions.find(
          (item) =>
            item.customerId === customer.id && item.status !== "terminated"
        );
        if (subscription) {
          changeSubscriptionPlan(subscription.id, target.id);
          migrated += 1;
        }
      });

      toast.success(
        `${migrated} langganan dimigrasikan ke ${target.name}.`
      );
    } else if (bulkAction === "isolate") {
      const reason = bulkReason.trim() || "Isolir massal.";
      await Promise.all(
        selected.map((customer) =>
          setCustomerStatus(customer.id, "suspended", reason)
        )
      );
      selected.forEach((customer) => {
        subscriptions
          .filter(
            (subscription) =>
              subscription.customerId === customer.id &&
              subscription.status === "active"
          )
          .forEach((subscription) =>
            suspendSubscription(subscription.id, reason)
          );
      });
      toast.success(`${selected.length} pelanggan diisolir.`);
    } else if (bulkAction === "activate") {
      await Promise.all(
        selected.map((customer) =>
          setCustomerStatus(customer.id, "active", "Aktivasi massal.")
        )
      );
      selected.forEach((customer) => {
        const subscription = subscriptions.find(
          (item) =>
            item.customerId === customer.id && item.status !== "terminated"
        );
        if (subscription?.status === "suspended") {
          reactivateSubscription(subscription.id);
        } else if (subscription?.status === "draft") {
          activateSubscription(subscription.id);
        }
      });
      toast.success(`${selected.length} pelanggan diaktifkan.`);
    } else if (bulkAction === "deactivate") {
      await Promise.all(
        selected.map((customer) =>
          setCustomerStatus(customer.id, "inactive", "Dinonaktifkan massal.")
        )
      );
      selected.forEach((customer) => {
        subscriptions
          .filter(
            (subscription) =>
              subscription.customerId === customer.id &&
              subscription.status === "active"
          )
          .forEach((subscription) =>
            suspendSubscription(
              subscription.id,
              "Pelanggan dinonaktifkan."
            )
          );
      });
      toast.success(`${selected.length} pelanggan dinonaktifkan.`);
    } else {
      const ids = selected.map((customer) => customer.id);
      selected.forEach((customer) => {
        subscriptions
          .filter(
            (subscription) =>
              subscription.customerId === customer.id &&
              subscription.status !== "terminated"
          )
          .forEach((subscription) =>
            terminateSubscription(subscription.id, "Pelanggan dihapus.")
          );
      });
      await deleteCustomers(ids);
      toast.success(`${ids.length} pelanggan dihapus.`);
    }

    setSelectedKeys(new Set());
    setBulkAction(null);
    setBulkReason("");
  }

  function viewCustomer(customerId: string) {
    router.push(`/dashboard/pelanggan/${customerId}`);
  }

  return {
    branches,
    query,
    setQuery,
    branch,
    setBranch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    currentPage,
    pageCount,
    rows,
    stats,
    exportCsv,
    viewCustomer,
    confirmCustomer,
    setConfirmCustomer,
    confirmToggle,
    selectedKeys,
    setSelectedKeys,
    selectedCount,
    selectableIds,
    bulkAction,
    bulkReason,
    setBulkReason,
    bulkTargetPlanId,
    setBulkTargetPlanId,
    bulkTargetOptions,
    startBulkAction,
    closeBulkAction,
    applyBulkAction,
    canActivate,
    canIsolate,
    canDeactivate,
    canMigrate,
    canDelete,
  };
}
