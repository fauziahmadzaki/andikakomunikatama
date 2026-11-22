"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { hasPermission } from "@/features/users/data/permissions";
import { useUsersStore } from "@/features/users/store/users-store";
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
  ["/dashboard/pelanggan/tagihan", "invoice.read"],
  ["/dashboard/pelanggan", "customer.read"],
  ["/dashboard/paket/edit", "plan.update"],
  ["/dashboard/paket/baru", "plan.create"],
  ["/dashboard/paket/diskon", "discount.read"],
  ["/dashboard/paket", "plan.read"],
  ["/dashboard/langganan", "subscription.read"],
  ["/dashboard/jaringan/inventaris", "inventory.read"],
  ["/dashboard/jaringan/gangguan", "ticket.read"],
  ["/dashboard/jaringan", "network.read"],
  ["/dashboard/teknisi", "ticket.read"],
  ["/dashboard/tagihan", "invoice.read"],
  ["/dashboard/pembayaran", "payment.read"],
  ["/dashboard/tiket", "ticket.read"],
  ["/dashboard/keuangan", "finance.read"],
  ["/dashboard/notifikasi", "notification.read"],
  ["/dashboard/laporan", "report.view"],
  ["/dashboard/integrasi", "integration.read"],
  ["/dashboard/migrasi", "migration.read"],
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
  const rolePermissions = useUsersStore((state) => state.rolePermissions);

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
