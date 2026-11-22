"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useBranchStore } from "@/features/branches/store/branch-store";
import type { TicketPriority } from "@/features/tickets/data/types";
import { useTicketStore } from "@/features/tickets/store/ticket-store";

export function useTicketsPage() {
  const tickets = useTicketStore((state) => state.tickets);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(
    () =>
      tickets.filter((ticket) => {
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
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "open").length,
      inProgress: tickets.filter((ticket) => ticket.status === "in_progress")
        .length,
      closed: tickets.filter((ticket) => ticket.status === "closed").length,
    }),
    [tickets]
  );

  return {
    tickets: filtered,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    stats,
    dialogOpen,
    setDialogOpen,
  };
}

export function useTicketDialog({ onClose }: { onClose: () => void }) {
  const branches = useBranchStore((state) => state.branches);
  const createTicket = useTicketStore((state) => state.createTicket);
  const [form, setForm] = useState({
    customerName: "",
    category: "Gangguan koneksi",
    subject: "",
    description: "",
    branchName: branches[0]?.name ?? "Jakarta Pusat",
    priority: "normal" as TicketPriority,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function save() {
    if (!form.customerName.trim() || !form.subject.trim()) {
      toast.error("Nama pelanggan dan subjek wajib diisi.");
      return;
    }
    createTicket(form);
    toast.success("Tiket dibuat.");
    onClose();
  }

  return { branches, form, set, save };
}

export function useTicketDetail(id: string) {
  const tickets = useTicketStore((state) => state.tickets);
  const events = useTicketStore((state) => state.events);
  const assignTicket = useTicketStore((state) => state.assignTicket);
  const transition = useTicketStore((state) => state.transition);
  const closeTicket = useTicketStore((state) => state.closeTicket);
  const addEvent = useTicketStore((state) => state.addEvent);
  const ticket = tickets.find((item) => item.id === id);
  const [technician, setTechnician] = useState("Teknisi NOC");
  const [notes, setNotes] = useState("");

  const ticketEvents = [...events]
    .filter((event) => event.ticketId === id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  function assign() {
    if (!ticket) {
      return;
    }
    assignTicket(ticket.id, technician);
    toast.success("Tiket ditugaskan.");
  }

  function move(status: "in_progress" | "pending" | "closed") {
    if (!ticket) {
      return;
    }
    if (status === "closed") {
      closeTicket(ticket.id, notes || "Tiket diselesaikan.");
      toast.success("Tiket ditutup.");
    } else {
      transition(ticket.id, status, notes || `Status menjadi ${status}.`);
      toast.success("Status tiket diperbarui.");
    }
    setNotes("");
  }

  function addNote() {
    if (!ticket || !notes.trim()) {
      return;
    }
    addEvent(ticket.id, notes);
    setNotes("");
    toast.success("Catatan ditambahkan.");
  }

  return {
    ticket,
    events: ticketEvents,
    technician,
    setTechnician,
    notes,
    setNotes,
    assign,
    move,
    addNote,
  };
}
