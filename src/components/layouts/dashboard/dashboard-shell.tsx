"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { DashboardSidebar } from "./parts/sidebar";
import { DashboardTopbar } from "./parts/topbar";
import { getPageTitle } from "./data/navigation";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-svh bg-muted/40">
      <DashboardSidebar
        open={mobileOpen}
        collapsed={collapsed}
        onClose={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((value) => !value)}
      />

      <div
        className={cn(
          "flex min-h-svh flex-col transition-[padding] duration-200",
          collapsed ? "lg:pl-[72px]" : "lg:pl-64"
        )}
      >
        <DashboardTopbar
          title={getPageTitle(pathname)}
          onMenu={() => {
            setCollapsed(false);
            setMobileOpen(true);
          }}
        />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
