"use client";

import { useState } from "react";
import {
  BoxesIcon,
  Building2Icon,
  CircleAlertIcon,
  CircleCheckIcon,
  CheckCheckIcon,
  ClockIcon,
  PackageIcon,
  PlusIcon,
  TicketIcon,
  UploadIcon,
  UserCheckIcon,
  UsersIcon,
  WifiOffIcon,
} from "lucide-react";

import {
  dashboardRangeOptions,
  defaultDashboardRange,
} from "@/features/dashboard/data/dashboard";
import { hasPermission } from "@/features/users/data/permissions";
import { useUsersStore } from "@/features/users/store/users-store";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useBillingStore } from "@/features/billing/store/billing-store";
import { useCustomerStore } from "@/features/customers/store/customer-store";
import { useTicketStore } from "@/features/tickets/store/ticket-store";

export function useDashboardHome() {
  const session = useAuthStore((state) => state.session);
  const [range, setRange] = useState(defaultDashboardRange);
  const rolePermissions = useUsersStore((state) => state.rolePermissions);
  const customers = useCustomerStore((state) => state.customers);
  const invoices = useBillingStore((state) => state.invoices);
  const tickets = useTicketStore((state) => state.tickets);

  const activeCustomers = customers.filter(
    (customer) => customer.status === "active"
  );
  // "Down" maps to suspended (isolir) customers until real PPPoE status is modeled.
  const suspended = customers.filter(
    (customer) => customer.status === "suspended"
  );
  const activeTickets = tickets.filter(
    (ticket) => ticket.status === "open" || ticket.status === "in_progress"
  ).length;
  const pendingTickets = tickets.filter(
    (ticket) => ticket.status === "pending"
  ).length;
  const closedTickets = tickets.filter(
    (ticket) => ticket.status === "closed"
  ).length;

  const remainingByCustomer = new Map<string, number>();
  for (const invoice of invoices) {
    if (invoice.status === "void") {
      continue;
    }

    remainingByCustomer.set(
      invoice.customerId,
      (remainingByCustomer.get(invoice.customerId) ?? 0) +
        (invoice.total - invoice.paidAmount)
    );
  }

  const remainingTotals = [...remainingByCustomer.values()];
  const paidCustomers = remainingTotals.filter(
    (remaining) => remaining <= 0
  ).length;
  const unpaidCustomers = remainingTotals.filter(
    (remaining) => remaining > 0
  ).length;

  const can = (code: string) =>
    session ? hasPermission(session.role, code, rolePermissions) : false;

  const stats = [
    {
      label: "Total pelanggan",
      value: String(customers.length),
      icon: UsersIcon,
      tone: "bg-primary text-primary-foreground",
      href: "/dashboard/pelanggan",
    },
    {
      label: "Pelanggan aktif",
      value: String(activeCustomers.length),
      icon: UserCheckIcon,
      tone: "bg-emerald-600 text-white",
      href: "/dashboard/pelanggan",
    },
    {
      label: "Pelanggan down",
      value: String(suspended.length),
      icon: WifiOffIcon,
      tone: "bg-destructive text-white",
      href: "/dashboard/pelanggan",
    },
    {
      label: "Pelanggan lunas",
      value: String(paidCustomers),
      icon: CircleCheckIcon,
      tone: "bg-emerald-600 text-white",
      href: "/dashboard/tagihan",
    },
    {
      label: "Pelanggan belum lunas",
      value: String(unpaidCustomers),
      icon: CircleAlertIcon,
      tone: "bg-amber-500 text-amber-950",
      href: "/dashboard/tagihan",
    },
    {
      label: "Tiket aktif",
      value: String(activeTickets),
      icon: TicketIcon,
      tone: "bg-primary text-primary-foreground",
      href: "/dashboard/tiket",
    },
    {
      label: "Tiket pending",
      value: String(pendingTickets),
      icon: ClockIcon,
      tone: "bg-amber-500 text-amber-950",
      href: "/dashboard/tiket",
    },
    {
      label: "Tiket closed",
      value: String(closedTickets),
      icon: CheckCheckIcon,
      tone: "bg-emerald-600 text-white",
      href: "/dashboard/tiket",
    },
  ];

  const recentTickets = [...tickets]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

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
    {
      label: "Paket",
      description: "Kelola paket PPPoE dan hotspot.",
      href: "/dashboard/paket",
      icon: PackageIcon,
      permission: "plan.read",
    },
    {
      label: "Inventaris",
      description: "Cek stok dan movement perangkat.",
      href: "/dashboard/jaringan/inventaris",
      icon: BoxesIcon,
      permission: "inventory.read",
    },
  ].filter((action) => can(action.permission));

  const rangeLabel =
    dashboardRangeOptions.find((option) => option.value === range)?.label ??
    "Hari ini";

  return {
    session,
    range,
    setRange,
    rangeLabel,
    activeCustomers,
    recentTickets,
    stats,
    quickActions,
    can,
  };
}
