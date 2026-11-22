"use client";

import { EyeIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { SelectField } from "@/components/shared/SelectField";
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Ticket, TicketStatus } from "@/features/tickets/data/types";
import { useNetworkIncidents } from "../hooks/useNetworkIncidents";

const tone: Record<TicketStatus, StatusTone> = {
  open: "primary",
  in_progress: "warning",
  pending: "neutral",
  closed: "success",
};

export function NetworkIncidentsPage() {
  const router = useRouter();
  const {
    incidents,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    stats,
  } = useNetworkIncidents();

  const columns: DataTableColumn<Ticket>[] = [
    {
      key: "number",
      header: "Tiket",
      cell: (ticket) => (
        <div>
          <p className="font-mono text-xs font-medium">{ticket.number}</p>
          <p className="text-xs text-muted-foreground">{ticket.customerName}</p>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Gangguan",
      cell: (ticket) => (
        <div>
          <p className="font-medium">{ticket.subject}</p>
          <p className="text-xs text-muted-foreground">{ticket.category}</p>
        </div>
      ),
    },
    { key: "branchName", header: "Cabang" },
    { key: "technician", header: "Teknisi" },
    {
      key: "priority",
      header: "Prioritas",
      cell: (ticket) => (
        <StatusBadge tone={ticket.priority === "urgent" ? "danger" : "neutral"}>
          {ticket.priority}
        </StatusBadge>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (ticket) => (
        <StatusBadge tone={tone[ticket.status]}>{ticket.status}</StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (ticket) => (
        <ActionIconButton
          icon={EyeIcon}
          label="Lihat detail gangguan"
          onPress={() => router.push(`/dashboard/tiket/${ticket.id}`)}
        />
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Gangguan jaringan"
        description="Tiket gangguan koneksi dan latency yang terkait jaringan."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total gangguan", value: stats.total },
          { label: "Open", value: stats.open },
          { label: "In progress", value: stats.inProgress },
          { label: "Urgent", value: stats.urgent },
        ].map((item) => (
          <Card key={item.label} className="gap-0 py-0">
            <CardContent className="space-y-1 p-5">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-bold tracking-tight">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="gap-0 py-0">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-2 lg:flex-row">
            <Input
              placeholder="Cari nomor, pelanggan, atau gangguan…"
              className="lg:max-w-sm"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="w-full lg:w-44">
              <SelectField
                value={statusFilter}
                onValueChange={setStatusFilter}
                ariaLabel="Filter status gangguan"
                options={[
                  { value: "all", label: "Semua status" },
                  { value: "open", label: "Open" },
                  { value: "in_progress", label: "In progress" },
                  { value: "pending", label: "Pending" },
                  { value: "closed", label: "Closed" },
                ]}
              />
            </div>
          </div>

          <DataTable
            data={incidents}
            columns={columns}
            getRowKey={(ticket) => ticket.id}
            ariaLabel="Daftar gangguan jaringan"
            emptyMessage="Tidak ada gangguan jaringan."
          />
        </CardContent>
      </Card>
    </div>
  );
}
