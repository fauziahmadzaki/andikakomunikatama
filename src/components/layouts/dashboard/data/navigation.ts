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
      { title: "Data pelanggan", href: "/dashboard/pelanggan" },
      { title: "Pendaftaran", href: "/dashboard/pelanggan/pendaftaran" },
      { title: "Tagihan", href: "/dashboard/pelanggan/tagihan" },
    ],
  },
  {
    title: "Jaringan",
    icon: WifiIcon,
    items: [
      { title: "Monitoring", href: "/dashboard/jaringan" },
      { title: "Perangkat", href: "/dashboard/jaringan/perangkat" },
      { title: "Gangguan", href: "/dashboard/jaringan/gangguan" },
    ],
  },
  {
    title: "Layanan",
    icon: TicketIcon,
    items: [
      { title: "Tiket", href: "/dashboard/tiket" },
      { title: "Jadwal teknisi", href: "/dashboard/teknisi" },
    ],
  },
  {
    title: "Pengaturan",
    icon: SettingsIcon,
    items: [
      { title: "Pengguna", href: "/dashboard/pengaturan/pengguna" },
      { title: "Role & akses", href: "/dashboard/pengaturan/role" },
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

