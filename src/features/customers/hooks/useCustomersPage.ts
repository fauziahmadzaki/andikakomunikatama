"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Customer } from "@/features/customers/data/types";
import { useCustomerStore } from "@/features/customers/store/customer-store";
import { useFoundationStore } from "@/features/foundation/store/foundation-store";

const PAGE_SIZE = 8;

export function useCustomersPage() {
  const router = useRouter();
  const customers = useCustomerStore((state) => state.customers);
  const setCustomerStatus = useCustomerStore((state) => state.setStatus);
  const branches = useFoundationStore((state) => state.branches);
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [confirmCustomer, setConfirmCustomer] = useState<Customer | null>(null);

  const filtered = useMemo(
    () =>
      customers.filter((customer) => {
        const matchesQuery =
          !query ||
          `${customer.fullName} ${customer.customerNumber} ${customer.phone} ${customer.email}`
            .toLowerCase()
            .includes(query.toLowerCase());
        const matchesBranch = branch === "all" || customer.branchId === branch;
        const matchesStatus =
          statusFilter === "all" || customer.status === statusFilter;
        return matchesQuery && matchesBranch && matchesStatus;
      }),
    [branch, customers, query, statusFilter]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const stats = useMemo(
    () => ({
      total: customers.length,
      active: customers.filter((customer) => customer.status === "active").length,
      suspended: customers.filter((customer) => customer.status === "suspended")
        .length,
      outstanding: customers.reduce(
        (total, customer) => total + customer.outstanding,
        0
      ),
    }),
    [customers]
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
      customer.phone,
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

  function confirmToggle() {
    if (!confirmCustomer) {
      return;
    }
    const next = confirmCustomer.status === "active" ? "inactive" : "active";
    setCustomerStatus(confirmCustomer.id, next);
    toast.success(
      next === "active" ? "Pelanggan diaktifkan." : "Pelanggan dinonaktifkan."
    );
    setConfirmCustomer(null);
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
  };
}
