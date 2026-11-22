import {
  BellIcon,
  LandmarkIcon,
  SettingsIcon,
  TicketIcon,
  UsersIcon,
  WifiIcon,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  permission?: string;
};

export type NavGroup = {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
};

export const dashboardHref = "/dashboard";

export const navigationGroups: NavGroup[] = [
  {
    title: "Layanan & Pelanggan",
    icon: UsersIcon,
    items: [
      {
        title: "Data pelanggan",
        href: "/dashboard/pelanggan",
        permission: "customer.read",
      },
      {
        title: "Tagihan",
        href: "/dashboard/tagihan",
        permission: "invoice.read",
      },
      {
        title: "Tiket",
        href: "/dashboard/tiket",
        permission: "ticket.read",
      },
      {
        title: "Paket",
        href: "/dashboard/paket",
        permission: "plan.read",
      },
      {
        title: "Diskon",
        href: "/dashboard/paket/diskon",
        permission: "discount.read",
      },
    ],
  },
  {
    title: "Keuangan & Transaksi",
    icon: LandmarkIcon,
    items: [
      {
        title: "Pembayaran layanan",
        href: "/dashboard/pembayaran",
        permission: "payment.read",
      },
      {
        title: "Keuangan",
        href: "/dashboard/keuangan",
        permission: "finance.read",
      },
      {
        title: "Rekonsiliasi",
        href: "/dashboard/pembayaran/rekonsiliasi",
        permission: "payment.read",
      },
      {
        title: "Jurnal",
        href: "/dashboard/keuangan/jurnal",
        permission: "finance.read",
      },
      {
        title: "Kas",
        href: "/dashboard/keuangan/kas",
        permission: "finance.read",
      },
      {
        title: "Chart of Accounts",
        href: "/dashboard/keuangan/coa",
        permission: "finance.read",
      },
      {
        title: "Laporan",
        href: "/dashboard/laporan",
        permission: "report.view",
      },
    ],
  },
  {
    title: "Otomasi",
    icon: BellIcon,
    items: [
      {
        title: "Notifikasi",
        href: "/dashboard/notifikasi",
        permission: "notification.read",
      },
      {
        title: "Integrasi",
        href: "/dashboard/integrasi",
        permission: "integration.read",
      },
      {
        title: "Migrasi",
        href: "/dashboard/migrasi",
        permission: "migration.read",
      },
    ],
  },
  {
    title: "Jaringan",
    icon: WifiIcon,
    items: [
      {
        title: "Ringkasan",
        href: "/dashboard/jaringan",
        permission: "network.read",
      },
      {
        title: "Router",
        href: "/dashboard/jaringan/router",
        permission: "network.read",
      },
      {
        title: "Monitoring SLA",
        href: "/dashboard/jaringan/sla",
        permission: "network.read",
      },
      {
        title: "Perangkat",
        href: "/dashboard/jaringan/perangkat",
        permission: "network.read",
      },
      {
        title: "Inventaris",
        href: "/dashboard/jaringan/inventaris",
        permission: "inventory.read",
      },
      {
        title: "Topologi",
        href: "/dashboard/jaringan/topologi",
        permission: "network.read",
      },
      {
        title: "Gangguan",
        href: "/dashboard/jaringan/gangguan",
        permission: "ticket.read",
      },
    ],
  },
  {
    title: "Dukungan",
    icon: TicketIcon,
    items: [
      {
        title: "Jadwal teknisi",
        href: "/dashboard/teknisi",
        permission: "ticket.read",
      },
    ],
  },
  {
    title: "Pengaturan",
    icon: SettingsIcon,
    items: [
      {
        title: "Perusahaan",
        href: "/dashboard/pengaturan/perusahaan",
        permission: "company.read",
      },
      {
        title: "Cabang",
        href: "/dashboard/pengaturan/cabang",
        permission: "branch.manage",
      },
      {
        title: "Pengguna",
        href: "/dashboard/pengaturan/pengguna",
        permission: "user.read",
      },
      {
        title: "Role & akses",
        href: "/dashboard/pengaturan/role",
        permission: "role.manage",
      },
      {
        title: "Access review",
        href: "/dashboard/pengaturan/akses",
        permission: "access.review",
      },
      {
        title: "Audit log",
        href: "/dashboard/pengaturan/audit",
        permission: "audit.read",
      },
      {
        title: "Keamanan",
        href: "/dashboard/pengaturan/keamanan",
        permission: "security.manage",
      },
      {
        title: "Penomoran",
        href: "/dashboard/pengaturan/penomoran",
        permission: "sequence.manage",
      },
      {
        title: "Sistem",
        href: "/dashboard/pengaturan/sistem",
        permission: "system.manage",
      },
    ],
  },
];

export const allNavigationItems: NavItem[] = navigationGroups.flatMap(
  (group) => group.items
);

export function isHrefActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findActiveHref(pathname: string) {
  return [...allNavigationItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isHrefActive(pathname, item.href))?.href;
}

export function getPageTitle(pathname: string) {
  if (pathname === dashboardHref) {
    return "Dashboard";
  }

  if (pathname === "/preview") {
    return "Design system";
  }

  if (pathname.startsWith("/dashboard/langganan/")) {
    return "Detail langganan";
  }

  const activeHref = findActiveHref(pathname);

  return (
    allNavigationItems.find((item) => item.href === activeHref)?.title ??
    "Dashboard"
  );
}
