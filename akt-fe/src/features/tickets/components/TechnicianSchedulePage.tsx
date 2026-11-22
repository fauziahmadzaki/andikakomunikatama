"use client";

import { CalendarDaysIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTechnicianSchedule } from "../hooks/useTechnicianSchedule";

export function TechnicianSchedulePage() {
  const { groups, stats } = useTechnicianSchedule();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Jadwal teknisi"
        description="Beban kerja dan penugasan teknisi dari tiket aktif."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Teknisi aktif", value: stats.technicians },
          { label: "Tiket aktif", value: stats.active },
          { label: "Belum ditugaskan", value: stats.unassigned },
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

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Tidak ada tiket aktif.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {groups.map((group) => (
            <Card key={group.technician} className="gap-0 py-0">
              <CardHeader className="flex-row items-center justify-between border-b px-5 py-4">
                <CardTitle>{group.technician}</CardTitle>
                <CalendarDaysIcon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                {group.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="rounded-lg border p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{ticket.subject}</p>
                      <StatusBadge
                        tone={
                          ticket.priority === "urgent" ? "danger" : "neutral"
                        }
                      >
                        {ticket.priority}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ticket.number} · {ticket.customerName} ·{" "}
                      {ticket.branchName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Status: {ticket.status}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
