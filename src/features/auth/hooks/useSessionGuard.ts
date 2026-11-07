"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { hasPermission } from "@/features/auth/data/permissions";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useMounted } from "@/hooks/use-mounted";

const routePermissions: Array<[string, string]> = [
  ["/dashboard/pengaturan/perusahaan", "company.read"],
  ["/dashboard/pengaturan/cabang", "branch.manage"],
  ["/dashboard/pengaturan/pengguna", "user.read"],
  ["/dashboard/pengaturan/role", "role.manage"],
  ["/dashboard/pengaturan/akses", "access.review"],
  ["/dashboard/pengaturan/audit", "audit.read"],
  ["/dashboard/pengaturan/sistem", "setting.read"],
  ["/dashboard/pengaturan/penomoran", "sequence.read"],
  ["/dashboard/pengaturan/keamanan", "security.manage"],
  ["/dashboard/pelanggan/pendaftaran", "customer.create"],
  ["/dashboard/pelanggan/impor", "customer.import"],
  ["/dashboard/pelanggan/segmen", "customer.segment.manage"],
  ["/dashboard/pelanggan", "customer.read"],
];

function requiredPermission(pathname: string) {
  return [...routePermissions]
    .sort((a, b) => b[0].length - a[0].length)
    .find(
      ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )?.[1];
}

export function useSessionGuard() {
  const mounted = useMounted();
  const router = useRouter();
  const pathname = usePathname();
  const session = useAuthStore((state) => state.session);
  const rolePermissions = useAuthStore((state) => state.rolePermissions);

  useEffect(() => {
    if (mounted && !session) {
      router.replace("/login");
    }
  }, [mounted, session, router]);

  const permission = requiredPermission(pathname);
  const denied = Boolean(
    session &&
      permission &&
      !hasPermission(session.role, permission, rolePermissions)
  );

  return { mounted, session, denied };
}
