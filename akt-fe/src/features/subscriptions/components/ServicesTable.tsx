"use client";

import { PlayIcon, ShieldOffIcon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  serviceStatusLabel,
  serviceStatusTone,
} from "@/features/subscriptions/data/status";
import type { ServiceView } from "@/features/subscriptions/data/types";
import { formatDate } from "@/lib/format";

export function ServicesTable({
  services,
  onProvision,
  onTerminate,
}: {
  services: ServiceView[];
  onProvision: (service: ServiceView) => void;
  onTerminate: (service: ServiceView) => void;
}) {
  const columns: DataTableColumn<ServiceView>[] = [
    {
      key: "serviceType",
      header: "Service",
      cell: (service) => (
        <span className="font-medium">{service.serviceType}</span>
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
    { key: "routerName", header: "Router" },
    { key: "oltName", header: "OLT" },
    { key: "odpCode", header: "ODP" },
    {
      key: "installedAt",
      header: "Instalasi",
      cell: (service) => (
        <span className="text-muted-foreground">
          {formatDate(service.installedAt)}
        </span>
      ),
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
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (service) => (
        <div className="flex justify-end gap-1">
          {service.status === "pending" || service.status === "provisioned" ? (
            <ActionIconButton
              icon={PlayIcon}
              label="Provision service"
              onPress={() => onProvision(service)}
            />
          ) : null}
          {service.status !== "terminated" ? (
            <ActionIconButton
              icon={ShieldOffIcon}
              label="Terminasi service"
              tone="destructive"
              onPress={() => onTerminate(service)}
            />
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={services}
      columns={columns}
      getRowKey={(service) => service.id}
      ariaLabel="Service langganan"
      emptyMessage="Belum ada service."
    />
  );
}
