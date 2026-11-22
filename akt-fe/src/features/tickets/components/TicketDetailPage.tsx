"use client";

import { ArrowLeftIcon, CheckCircleIcon, PlayIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ticketStatusTone } from "@/features/tickets/data/status";
import { useTicketDetail } from "@/features/tickets/hooks/useTickets";
import { formatDateTime } from "@/lib/format";

export function TicketDetailPage({ id }: { id: string }) {
  const {
    ticket,
    events,
    technician,
    setTechnician,
    notes,
    setNotes,
    assign,
    move,
    addNote,
  } = useTicketDetail(id);

  if (!ticket) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">Tiket tidak ditemukan</p>
        <LinkButton href="/dashboard/tiket">Kembali ke tiket</LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-3">
        <LinkButton
          href="/dashboard/tiket"
          variant="ghost"
          size="sm"
          className="-ml-2"
        >
          <ArrowLeftIcon />
          Kembali ke tiket
        </LinkButton>
        <PageHeader
          title={ticket.subject}
          description={`${ticket.number} · ${ticket.customerName} · ${ticket.branchName}`}
        >
          <StatusBadge tone={ticketStatusTone[ticket.status]}>
            {ticket.status}
          </StatusBadge>
        </PageHeader>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-0 py-0 lg:col-span-2">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle>Detail tiket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Kategori</p>
                <p className="font-medium">{ticket.category}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Prioritas</p>
                <p className="font-medium">{ticket.priority}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Teknisi</p>
                <p className="font-medium">{ticket.technician}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dibuat</p>
                <p className="font-medium">{ticket.createdAt}</p>
              </div>
            </div>
            <p className="rounded-lg bg-muted/50 p-3 text-muted-foreground">
              {ticket.description}
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle>Aksi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Assign teknisi</p>
              <Input
                value={technician}
                onChange={(event) => setTechnician(event.target.value)}
              />
              <Button variant="outline" className="w-full" onPress={assign}>
                <PlayIcon />
                Assign
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onPress={() => move("in_progress")}>
                In progress
              </Button>
              <Button variant="outline" onPress={() => move("pending")}>
                Pending
              </Button>
              <Button className="col-span-2" onPress={() => move("closed")}>
                <CheckCircleIcon />
                Tutup tiket
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Riwayat & catatan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <div className="space-y-2">
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Tambahkan catatan penanganan…"
              rows={2}
            />
            <div className="flex justify-end">
              <Button variant="outline" onPress={addNote}>
                Tambah catatan
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="rounded-lg border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{event.action}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(event.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">{event.notes}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  oleh {event.actor}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
