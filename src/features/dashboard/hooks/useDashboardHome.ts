"use client";

import {
  ArrowUpRightIcon,
  Building2Icon,
  ClipboardListIcon,
  PlusIcon,
  UploadIcon,
  UsersIcon,
} from "lucide-react";

import { hasPermission } from "@/features/auth/data/permissions";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { formatRupiah } from "@/features/customers/data/status";
import { useCustomerStore } from "@/features/customers/store/customer-store";
import { useFoundationStore } from "@/features/foundation/store/foundation-store";

export function useDashboardHome() {
  const session = useAuthStore((state) => state.session);
  const rolePermissions = useAuthStore((state) => state.rolePermissions);
  const users = useAuthStore((state) => state.users);
  const customers = useCustomerStore((state) => state.customers);
  const branches = useFoundationStore((state) => state.branches);
  const auditLogs = useFoundationStore((state) => state.auditLogs);

  const activeCustomers = customers.filter(
    (customer) => customer.status === "active"
  );
  const suspended = customers.filter(
    (customer) => customer.status === "suspended"
  );
  const outstanding = customers.reduce(
    (total, customer) => total + customer.outstanding,
    0
  );

  const can = (code: string) =>
    session ? hasPermission(session.role, code, rolePermissions) : false;

  const stats = [
    {
      label: "Pelanggan aktif",
      value: String(activeCustomers.length),
      icon: UsersIcon,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Cabang aktif",
      value: String(branches.filter((branch) => branch.isActive).length),
      icon: Building2Icon,
      tone: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Pelanggan isolir",
      value: String(suspended.length),
      icon: ClipboardListIcon,
      tone: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Total outstanding",
      value: formatRupiah(outstanding),
      icon: ArrowUpRightIcon,
      tone: "bg-destructive/10 text-destructive",
    },
  ];

  const quickActions = [
    {
      label: "Tambah pelanggan",
      description: "Daftarkan pelanggan baru lewat wizard.",
      href: "/dashboard/pelanggan/pendaftaran",
      icon: PlusIcon,
      permission: "customer.create",
    },
    {
      label: "Impor pelanggan",
      description: "Upload CSV dan validasi sebelum commit.",
      href: "/dashboard/pelanggan/impor",
      icon: UploadIcon,
      permission: "customer.import",
    },
    {
      label: "Kelola cabang",
      description: "Tambah atau nonaktifkan unit bisnis.",
      href: "/dashboard/pengaturan/cabang",
      icon: Building2Icon,
      permission: "branch.manage",
    },
    {
      label: "Kelola pengguna",
      description: "Atur role dan akses staff.",
      href: "/dashboard/pengaturan/pengguna",
      icon: UsersIcon,
      permission: "user.manage",
    },
  ].filter((action) => can(action.permission));

  return {
    session,
    activeCustomers,
    suspended,
    customers,
    users,
    auditLogs,
    stats,
    quickActions,
    can,
  };
}
