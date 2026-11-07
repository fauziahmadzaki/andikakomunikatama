"use client";

import { ClipboardListIcon, UsersIcon } from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardHome } from "@/features/dashboard/hooks/useDashboardHome";

export function DashboardHome() {
  const {
    session,
    activeCustomers,
    suspended,
    customers,
    users,
    auditLogs,
    stats,
    quickActions,
    can,
  } = useDashboardHome();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Halo, {session?.name ?? "Administrator"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan operasional {session?.branchName ?? "MuraNET"} hari ini.
          </p>
        </div>
        <StatusBadge tone="primary">
          {activeCustomers.length} pelanggan aktif
        </StatusBadge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="gap-0 py-0">
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <span
                  className={`flex size-8 items-center justify-center rounded-lg ${stat.tone}`}
                >
                  <stat.icon className="size-4" />
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-0 py-0 lg:col-span-2">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle>Aktivitas terbaru</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {auditLogs.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between gap-3 px-5 py-3"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{log.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.actor} · {log.branch}
                  </p>
                </div>
                <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {log.action}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="gap-0 py-0">
            <CardHeader className="border-b px-5 py-4">
              <CardTitle>Aksi cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              {quickActions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Tidak ada aksi cepat untuk role ini.
                </p>
              ) : (
                quickActions.map((action) => (
                  <LinkButton
                    key={action.href}
                    href={action.href}
                    variant="outline"
                    className="h-auto w-full justify-start gap-3 py-2.5 text-left"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <action.icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {action.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {action.description}
                      </span>
                    </span>
                  </LinkButton>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b px-5 py-4">
              <CardTitle>Status pelanggan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 text-sm">
              {[
                {
                  label: "Aktif",
                  count: activeCustomers.length,
                  tone: "success" as const,
                },
                {
                  label: "Isolir",
                  count: suspended.length,
                  tone: "warning" as const,
                },
                {
                  label: "Nonaktif",
                  count: customers.filter((item) => item.status === "inactive")
                    .length,
                  tone: "neutral" as const,
                },
                {
                  label: "Draft",
                  count: customers.filter((item) => item.status === "draft")
                    .length,
                  tone: "primary" as const,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <StatusBadge tone={item.tone}>{item.label}</StatusBadge>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
              <div className="border-t pt-2 text-xs text-muted-foreground">
                {users.filter((user) => user.status === "active").length} pengguna
                aktif
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <LinkButton href="/dashboard/pelanggan" variant="outline">
          <UsersIcon />
          Lihat semua pelanggan
        </LinkButton>
        {can("audit.read") ? (
          <LinkButton href="/dashboard/pengaturan/audit" variant="outline">
            <ClipboardListIcon />
            Lihat audit log
          </LinkButton>
        ) : null}
      </div>
    </div>
  );
}
