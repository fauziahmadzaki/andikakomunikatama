"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  LogOutIcon,
  PanelLeftIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BrandMark } from "./brand";
import { SidebarNavGroup } from "./nav-group";
import { SidebarNavLink } from "./nav-link";
import {
  dashboardHref,
  findActiveHref,
  navigationGroups,
  type NavGroup,
} from "../data/navigation";
import { cn } from "@/lib/utils";

export function DashboardSidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapse,
}: {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();
  const activeHref = findActiveHref(pathname);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function isGroupOpen(group: NavGroup) {
    return (
      expanded[group.title] ??
      group.items.some((item) => item.href === activeHref)
    );
  }

  function toggleGroup(group: NavGroup) {
    setExpanded((previous) => ({
      ...previous,
      [group.title]: !isGroupOpen(group),
    }));
  }

  const expandedNavigation = (
    <>
      <SidebarNavLink
        href={dashboardHref}
        title="Dashboard"
        icon={LayoutDashboardIcon}
        active={pathname === dashboardHref}
        onNavigate={onClose}
      />

      {navigationGroups.map((group) => (
        <SidebarNavGroup
          key={group.title}
          group={group}
          activeHref={activeHref}
          open={isGroupOpen(group)}
          onToggle={() => toggleGroup(group)}
          onNavigate={onClose}
        />
      ))}
    </>
  );

  const iconNavigation = (
    <>
      <SidebarNavLink
        href={dashboardHref}
        title="Dashboard"
        icon={LayoutDashboardIcon}
        active={pathname === dashboardHref}
        iconOnly
        onNavigate={onClose}
      />

      {navigationGroups.map((group) => {
        const groupActive = group.items.some(
          (item) => item.href === activeHref
        );

        return (
          <SidebarNavLink
            key={group.title}
            href={group.items[0].href}
            title={group.title}
            icon={group.icon}
            active={groupActive}
            iconOnly
            onNavigate={onClose}
          />
        );
      })}
    </>
  );

  return (
    <>
      {open ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 -translate-x-full flex-col border-r bg-background transition-[transform,width] duration-200 ease-brand lg:translate-x-0",
          open && "translate-x-0",
          collapsed && "lg:w-[72px]"
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center border-b",
            collapsed ? "lg:justify-center lg:px-2" : "justify-between px-5"
          )}
        >
          <div className={cn(collapsed && "lg:hidden")}>
            <BrandMark onNavigate={onClose} collapsed={collapsed} />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            aria-label={
              collapsed ? "Perluas sidebar" : "Ciutkan sidebar"
            }
            onPress={onToggleCollapse}
          >
            <PanelLeftIcon />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Tutup menu"
            onPress={onClose}
          >
            <XIcon />
          </Button>
        </div>

        <nav
          aria-label="Menu utama"
          className={cn(
            "flex-1 space-y-1 overflow-y-auto",
            collapsed ? "py-3 lg:px-2" : "px-4 py-3"
          )}
        >
          {collapsed ? (
            <>
              <div className="hidden lg:flex lg:flex-col lg:items-center lg:gap-1">
                {iconNavigation}
              </div>
              <div className="lg:hidden">{expandedNavigation}</div>
            </>
          ) : (
            expandedNavigation
          )}
        </nav>

        <div className={cn("border-t px-4 py-3", collapsed && "lg:p-2")}>
          <Link
            href="/login"
            title="Keluar"
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              collapsed && "lg:justify-center lg:px-0"
            )}
          >
            <LogOutIcon aria-hidden="true" className="size-4" />
            <span className={cn(collapsed && "lg:hidden")}>Keluar</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
