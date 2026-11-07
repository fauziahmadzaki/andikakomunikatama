"use client";

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import type {
  Customer,
  CustomerService,
} from "@/features/customers/data/types";

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function CustomerSubscriptionsTab({
  customer,
  services,
}: {
  customer: Customer;
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
      <CardContent className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Paket</p>
            <p className="font-medium">{customer.planName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Biaya bulanan</p>
            <p className="font-medium">{rupiah(customer.monthlyFee)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Jatuh tempo</p>
            <p className="font-medium">Tanggal {customer.dueDay}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <StatusBadge
              tone={customer.subscriptionStatus === "active" ? "success" : "warning"}
            >
              {customer.subscriptionStatus}
            </StatusBadge>
          </div>
        </div>

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
