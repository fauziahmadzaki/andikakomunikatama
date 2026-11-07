import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layouts/dashboard";

export default function InternalLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
