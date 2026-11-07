"use client";

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import type { CustomerTicket } from "@/features/customers/data/types";

export function CustomerTicketsTab({
  tickets,
}: {
  tickets: CustomerTicket[];
}) {
  const columns: DataTableColumn<CustomerTicket>[] = [
    {
      key: "number",
      header: "Tiket",
      cell: (ticket) => (
        <span className="font-mono text-xs">{ticket.number}</span>
      ),
    },
    {
      key: "category",
      header: "Kategori",
    },
    {
      key: "technician",
      header: "Teknisi",
      cell: (ticket) => (
        <span className="text-muted-foreground">{ticket.technician}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Tanggal",
      cell: (ticket) => (
        <span className="text-muted-foreground">{ticket.createdAt}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (ticket) => (
        <StatusBadge
          tone={
            ticket.status === "closed"
              ? "success"
              : ticket.status === "in_progress"
                ? "warning"
                : "primary"
          }
        >
          {ticket.status}
        </StatusBadge>
      ),
    },
  ];

  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-4">
        <DataTable
          data={tickets}
          columns={columns}
          getRowKey={(ticket) => ticket.id}
          ariaLabel="Tiket pelanggan"
          emptyMessage="Belum ada tiket."
        />
      </CardContent>
    </Card>
  );
}
