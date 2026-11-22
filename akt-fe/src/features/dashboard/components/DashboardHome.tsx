"use client";

import Link from "next/link";
import { ArrowRightIcon, ClipboardListIcon, PlusIcon, UsersIcon } from "lucide-react";

import { SelectField } from "@/components/shared/SelectField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, LinkButton } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dashboardRangeOptions } from "@/features/dashboard/data/dashboard";
import { useDashboardHome } from "@/features/dashboard/hooks/useDashboardHome";
import { ticketStatusTone } from "@/features/tickets/data/status";
import { formatDate } from "@/lib/format";

export function DashboardHome() {
  const {
    session,
    range,
    setRange,
    rangeLabel,
    activeCustomers,
    recentTickets,
    stats,
    quickActions,
    can,
  } = useDashboardHome();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Halo, {session?.name ?? "Administrator"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Ringkasan operasional {session?.branchName ?? "MuraNET"} ·{" "}
              {rangeLabel.toLowerCase()}.
            </p>
          </div>
          <StatusBadge tone="primary">
            {activeCustomers.length} pelanggan aktif
          </StatusBadge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SelectField
            value={range}
            onValueChange={setRange}
            options={dashboardRangeOptions}
            ariaLabel="Rentang waktu dashboard"
            className="w-40"
          />
          <Button type="button" variant="outline" size="lg">
            <PlusIcon />
            Tambah widget
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="gap-0 py-0">
            <CardContent className="relative flex flex-1 flex-col gap-4 p-5 pb-12">
              <div className="flex items-start gap-3">
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full ${stat.tone}`}
                >
                  <stat.icon className="size-5" />
                </span>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                </div>
              </div>
              <LinkButton
                href={stat.href}
                variant="ghost"
                size="xs"
                aria-label={`Selengkapnya untuk ${stat.label}`}
                className="absolute right-3 bottom-3"
              >
                Selengkapnya
                <ArrowRightIcon />
              </LinkButton>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Aksi cepat</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {quickActions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tidak ada aksi cepat untuk role ini.
            </p>
          ) : (
            <div className="grid w-full gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {quickActions.map((action) => (
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Tiket terbaru</CardTitle>
          <CardAction>
            <LinkButton
              href="/dashboard/tiket"
              variant="ghost"
              size="xs"
              className="-mr-2"
            >
              Lihat semua
              <ArrowRightIcon />
            </LinkButton>
          </CardAction>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {recentTickets.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground">
              Belum ada tiket.
            </p>
          ) : (
            recentTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/dashboard/tiket/${ticket.id}`}
                className="flex items-start justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-medium">
                    {ticket.subject}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {ticket.number} · {ticket.customerName}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge tone={ticketStatusTone[ticket.status]}>
                    {ticket.status}
                  </StatusBadge>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(ticket.createdAt)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

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
