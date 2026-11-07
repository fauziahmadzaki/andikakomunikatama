"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Toaster } from "@/components/ui/sonner";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";
import { getPageTitle } from "./data/navigation";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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

      <Toaster position="top-right" />
    </div>
  );
}
