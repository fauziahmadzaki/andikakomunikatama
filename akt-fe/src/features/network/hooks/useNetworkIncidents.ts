"use client";

import { useMemo, useState } from "react";

import { useTicketStore } from "@/features/tickets/store/ticket-store";

export function useNetworkIncidents() {
  const tickets = useTicketStore((state) => state.tickets);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const incidents = useMemo(
    () =>
      tickets.filter((ticket) => {
        const networkTicket =
          ticket.category.toLowerCase().includes("gangguan") ||
          ticket.subject.toLowerCase().includes("koneksi") ||
          ticket.subject.toLowerCase().includes("latency");
        if (!networkTicket) {
          return false;
        }
        const matchesQuery =
          !query ||
          `${ticket.number} ${ticket.customerName} ${ticket.subject}`
            .toLowerCase()
            .includes(query.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || ticket.status === statusFilter;
        return matchesQuery && matchesStatus;
      }),
    [query, statusFilter, tickets]
  );

  const stats = useMemo(
    () => ({
      total: incidents.length,
      open: incidents.filter((ticket) => ticket.status === "open").length,
      inProgress: incidents.filter((ticket) => ticket.status === "in_progress")
        .length,
      urgent: incidents.filter((ticket) => ticket.priority === "urgent").length,
    }),
    [incidents]
  );

  return {
    incidents,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    stats,
  };
}
