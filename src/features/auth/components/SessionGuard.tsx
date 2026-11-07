"use client";

import { DashboardShell } from "@/components/layouts/dashboard";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { Spinner } from "@/components/ui/spinner";
import { useSessionGuard } from "@/features/auth/hooks/useSessionGuard";
import type { ReactNode } from "react";

export function SessionGuard({ children }: { children: ReactNode }) {
  const { mounted, session, denied } = useSessionGuard();

  if (!mounted || !session) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (denied) {
    return <AccessDenied />;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
