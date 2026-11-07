import {
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
    title: "Pelanggan",
    icon: UsersIcon,
    items: [
      {
        title: "Data pelanggan",
        href: "/dashboard/pelanggan",
        permission: "customer.read",
      },
      {
        title: "Pendaftaran",
        href: "/dashboard/pelanggan/pendaftaran",
        permission: "customer.create",
      },
      {
        title: "Impor pelanggan",
        href: "/dashboard/pelanggan/impor",
        permission: "customer.import",
      },
      {
        title: "Segmen",
        href: "/dashboard/pelanggan/segmen",
        permission: "customer.segment.manage",
      },
      {
        title: "Tagihan",
        href: "/dashboard/pelanggan/tagihan",
        permission: "invoice.read",
      },
    ],
  },
  {
    title: "Jaringan",
    icon: WifiIcon,
    items: [
      {
        title: "Monitoring",
        href: "/dashboard/jaringan",
        permission: "network.read",
      },
      {
        title: "Perangkat",
        href: "/dashboard/jaringan/perangkat",
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
    title: "Layanan",
    icon: TicketIcon,
    items: [
      {
        title: "Tiket",
        href: "/dashboard/tiket",
        permission: "ticket.read",
      },
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
        title: "Pengaturan sistem",
        href: "/dashboard/pengaturan/sistem",
        permission: "setting.read",
      },
      {
        title: "Penomoran",
        href: "/dashboard/pengaturan/penomoran",
        permission: "sequence.read",
      },
      {
        title: "Keamanan",
        href: "/dashboard/pengaturan/keamanan",
        permission: "security.manage",
      },
    ],
  },
];

export const allNavigationItems = navigationGroups.flatMap(
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

  const activeHref = findActiveHref(pathname);

  return (
    allNavigationItems.find((item) => item.href === activeHref)?.title ??
    "Dashboard"
  );
}
