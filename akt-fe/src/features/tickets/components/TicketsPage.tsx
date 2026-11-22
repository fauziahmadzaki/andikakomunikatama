"use client";

import { EyeIcon, PlusIcon, SearchIcon } from "lucide-react";

import { useRouter } from "next/navigation";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { SelectField } from "@/components/shared/SelectField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ticketStatusTone } from "@/features/tickets/data/status";
import type { Ticket } from "@/features/tickets/data/types";
import { useTicketsPage } from "@/features/tickets/hooks/useTickets";
import { TicketDialog } from "./TicketDialog";

export function TicketsPage() {
  const router = useRouter();
  const {
    tickets,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    stats,
    dialogOpen,
    setDialogOpen,
  } = useTicketsPage();

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
      header: "Masalah",
      cell: (ticket) => (
        <div>
          <p className="font-medium">{ticket.subject}</p>
          <p className="text-xs text-muted-foreground">{ticket.category}</p>
        </div>
      ),
    },
    {
      key: "branchName",
      header: "Cabang",
      cell: (ticket) => (
        <span className="text-muted-foreground">{ticket.branchName}</span>
      ),
    },
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
        <StatusBadge tone={ticketStatusTone[ticket.status]}>
          {ticket.status}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (ticket) => (
        <ActionIconButton
          icon={EyeIcon}
          label="Lihat detail tiket"
          onPress={() => {
            router.push(`/dashboard/tiket/${ticket.id}`);
          }}
        />
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Tiket"
        description="Kelola tiket pelanggan dan pekerjaan lapangan."
      >
        <Button onPress={() => setDialogOpen(true)}>
          <PlusIcon />
          Buat tiket
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total tiket", value: stats.total },
          { label: "Open", value: stats.open },
          { label: "In progress", value: stats.inProgress },
          { label: "Closed", value: stats.closed },
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
            <div className="relative w-full lg:max-w-sm">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nomor, pelanggan, atau subjek…"
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="w-full lg:w-44">
              <SelectField
                value={statusFilter}
                onValueChange={setStatusFilter}
                ariaLabel="Filter status tiket"
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
            data={tickets}
            columns={columns}
            getRowKey={(ticket) => ticket.id}
            ariaLabel="Daftar tiket"
            emptyMessage="Tidak ada tiket."
          />
        </CardContent>
      </Card>

      {dialogOpen ? (
        <TicketDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      ) : null}
    </div>
  );
}
