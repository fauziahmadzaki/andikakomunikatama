import {
  SettingsIcon,
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

export const dashboardHref = "/dashboard/jaringan/router";

export const navigationGroups: NavGroup[] = [
  {
    title: "Jaringan",
    icon: WifiIcon,
    items: [
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
    ],
  },
  {
    title: "Pengaturan",
    icon: SettingsIcon,
    items: [
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
        title: "Telegram",
        href: "/dashboard/pengaturan/telegram",
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

  const activeHref = findActiveHref(pathname);

  return (
    allNavigationItems.find((item) => item.href === activeHref)?.title ??
    "Dashboard"
  );
}
