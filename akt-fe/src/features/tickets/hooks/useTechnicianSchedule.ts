"use client";

import { useMemo } from "react";

import { useTicketStore } from "@/features/tickets/store/ticket-store";

export function useTechnicianSchedule() {
  const tickets = useTicketStore((state) => state.tickets);

  const activeTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status !== "closed"),
    [tickets]
  );

  const groups = useMemo(() => {
    const map = new Map<string, typeof activeTickets>();
    for (const ticket of activeTickets) {
      const name = ticket.technician || "Belum ditugaskan";
      const current = map.get(name) ?? [];
      current.push(ticket);
      map.set(name, current);
    }
    return [...map.entries()]
      .map(([technician, items]) => ({ technician, tickets: items }))
      .sort((a, b) => b.tickets.length - a.tickets.length);
  }, [activeTickets]);

  return {
    groups,
    stats: {
      technicians: groups.filter((group) => group.technician !== "Belum ditugaskan")
        .length,
      unassigned: activeTickets.filter(
        (ticket) => ticket.technician === "Belum ditugaskan"
      ).length,
      active: activeTickets.length,
      urgent: activeTickets.filter((ticket) => ticket.priority === "urgent")
        .length,
    },
  };
}
