"use client";

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import type { CustomerService } from "@/features/customers/data/types";

export function CustomerNetworkTab({
  services,
}: {
  services: CustomerService[];
}) {
  const columns: DataTableColumn<CustomerService>[] = [
    {
      key: "serviceType",
      header: "Service",
      cell: (service) => <span className="font-medium">{service.serviceType}</span>,
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
      key: "router",
      header: "Router",
    },
    {
      key: "odp",
      header: "ODP",
    },
    {
      key: "status",
      header: "Status",
      cell: (service) => (
        <StatusBadge tone={service.status === "active" ? "success" : "warning"}>
          {service.status}
        </StatusBadge>
      ),
    },
  ];

  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-4">
        <DataTable
          data={services}
          columns={columns}
          getRowKey={(service) => service.id}
          ariaLabel="Data jaringan pelanggan"
          emptyMessage="Belum ada data jaringan."
        />
      </CardContent>
    </Card>
  );
}
