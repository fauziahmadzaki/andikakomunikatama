"use client";

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNetworkStore } from "@/features/network/store/network-store";
import {
  serviceStatusLabel,
  serviceStatusTone,
  subscriptionStatusLabel,
  subscriptionTone,
} from "@/features/subscriptions/data/status";
import type {
  ConnectionType,
  IncentiveMethod,
  Subscription,
  SubscriptionService,
} from "@/features/subscriptions/data/types";
import { useUsersStore } from "@/features/users/store/users-store";
import { formatRupiah } from "@/lib/format";

const connectionLabel: Record<ConnectionType, string> = {
  static: "Static",
  dhcp: "DHCP",
  pppoe: "PPPoE",
  hotspot: "Hotspot",
};

const incentiveLabel: Record<IncentiveMethod, string> = {
  none: "Tanpa insentif",
  fixed: "Nominal tetap",
  percentage: "Persentase",
};

export function CustomerSubscriptionsTab({
  subscription,
  planName,
  services,
}: {
  subscription?: Subscription;
  planName: string;
  services: SubscriptionService[];
}) {
  const routers = useNetworkStore((state) => state.routers);
  const olts = useNetworkStore((state) => state.olts);
  const passiveDevices = useNetworkStore((state) => state.passiveDevices);
  const employees = useUsersStore((state) => state.employees);
  const salesName =
    employees.find((item) => item.id === subscription?.salesEmployeeId)
      ?.fullName ?? "-";
  const incentiveValue =
    subscription?.incentiveMethod === "percentage"
      ? `${subscription.incentiveValue ?? 0}%`
      : formatRupiah(subscription?.incentiveValue ?? 0);

  const columns: DataTableColumn<SubscriptionService>[] = [
    {
      key: "serviceType",
      header: "Service",
      cell: (service) => (
        <span className="font-medium">
          {connectionLabel[service.serviceType as ConnectionType] ??
            service.serviceType}
        </span>
      ),
    },
    {
      key: "username",
      header: "Username",
      cell: (service) => (
        <span className="font-mono text-xs text-muted-foreground">
          {service.username}
        </span>
      ),
    },
    {
      key: "routerId",
      header: "Router",
      cell: (service) =>
        routers.find((router) => router.id === service.routerId)?.name ?? "-",
    },
    {
      key: "oltId",
      header: "OLT",
      cell: (service) =>
        olts.find((olt) => olt.id === service.oltId)?.name ?? "-",
    },
    {
      key: "passiveDeviceId",
      header: "ODP",
      cell: (service) =>
        passiveDevices.find((device) => device.id === service.passiveDeviceId)
          ?.code ?? "-",
    },
    {
      key: "status",
      header: "Status",
      cell: (service) => (
        <StatusBadge tone={serviceStatusTone[service.status]}>
          {serviceStatusLabel[service.status]}
        </StatusBadge>
      ),
    },
  ];

  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-5 p-5">
        {subscription ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Ringkasan langganan</p>
              <LinkButton
                href={`/dashboard/langganan/${subscription.id}`}
                variant="outline"
                size="sm"
              >
                Kelola langganan
              </LinkButton>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Paket</p>
                <p className="font-medium">{planName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Biaya bulanan</p>
                <p className="font-medium">
                  {formatRupiah(subscription.priceSnapshot)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jatuh tempo</p>
                <p className="font-medium">Tanggal {subscription.dueDay}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge tone={subscriptionTone[subscription.status]}>
                  {subscriptionStatusLabel[subscription.status]}
                </StatusBadge>
              </div>
            </div>
            <div className="grid gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Registrasi</p>
                <p className="font-medium">{subscription.startDate}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">PPN</p>
                <p className="font-medium">
                  {subscription.taxEnabled ? "Ya" : "Tidak"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Insentif</p>
                <p className="font-medium">
                  {subscription.incentiveMethod
                    ? incentiveLabel[subscription.incentiveMethod]
                    : "Tanpa insentif"}
                  {subscription.incentiveMethod &&
                  subscription.incentiveMethod !== "none"
                    ? ` · ${incentiveValue}`
                    : ""}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sales</p>
                <p className="font-medium">{salesName}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Pelanggan belum memiliki langganan.
          </p>
        )}

        <DataTable
          data={services}
          columns={columns}
          getRowKey={(service) => service.id}
          ariaLabel="Service pelanggan"
          emptyMessage="Belum ada service terdaftar."
        />
      </CardContent>
    </Card>
  );
}
