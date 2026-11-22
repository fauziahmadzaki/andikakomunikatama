"use client";

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import type { Ticket } from "@/features/tickets/data/types";
import { formatDate } from "@/lib/format";

const ticketTone: Record<string, StatusTone> = {
  open: "primary",
  in_progress: "warning",
  pending: "neutral",
  closed: "success",
};

export function CustomerTicketsTab({ tickets }: { tickets: Ticket[] }) {
  const columns: DataTableColumn<Ticket>[] = [
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
        <span className="text-muted-foreground">
          {formatDate(ticket.createdAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (ticket) => (
        <StatusBadge tone={ticketTone[ticket.status] ?? "neutral"}>
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
