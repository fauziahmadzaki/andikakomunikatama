import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateUUID } from "@/lib/uuid";

import { useAuditStore } from "@/features/audit/store/audit-store";
import { seedTicketEvents, seedTickets } from "../data/seed";
import type { Ticket, TicketEvent, TicketPriority } from "../data/types";

type NewTicket = {
  customerName: string;
  category: string;
  subject: string;
  description: string;
  branchName: string;
  priority: TicketPriority;
};

type TicketsState = {
  tickets: Ticket[];
  events: TicketEvent[];
  createTicket: (input: NewTicket) => void;
  assignTicket: (id: string, technician: string) => void;
  addEvent: (id: string, notes: string) => void;
  transition: (id: string, status: Ticket["status"], notes: string) => void;
  closeTicket: (id: string, notes: string) => void;
  resetTickets: () => void;
};

function id() {
  return generateUUID();
}

function now() {
  return new Date().toISOString();
}

function audit(action: string, entityId: string, description: string) {
  useAuditStore.getState().addAudit({
    action,
    entityType: "ticket",
    entityId,
    actor: "Administrator",
    branch: "JKT-01",
    description,
  });
}

export const useTicketStore = create<TicketsState>()(
  persist(
    (set, get) => ({
      tickets: seedTickets,
      events: seedTicketEvents,

      createTicket: (input) => {
        const ticket: Ticket = {
          ...input,
          id: id(),
          number: `TKT-2026-${String(1900 + get().tickets.length).padStart(6, "0")}`,
          status: "open",
          technician: "Belum ditugaskan",
          createdAt: now().slice(0, 10),
        };
        set((state) => ({
          tickets: [ticket, ...state.tickets],
          events: [
            {
              id: id(),
              ticketId: ticket.id,
              actor: "Customer Service",
              action: "created",
              notes: "Tiket dibuat.",
              createdAt: now(),
            },
            ...state.events,
          ],
        }));
        audit("ticket.created", ticket.number, `Tiket ${ticket.number} dibuat.`);
      },

      assignTicket: (ticketId, technician) => {
        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === ticketId
              ? { ...ticket, technician, status: "in_progress" }
              : ticket
          ),
          events: [
            {
              id: id(),
              ticketId,
              actor: "NOC",
              action: "assigned",
              notes: `Ditugaskan ke ${technician}.`,
              createdAt: now(),
            },
            ...state.events,
          ],
        }));
        audit("ticket.assigned", ticketId, `Tiket ditugaskan ke ${technician}.`);
      },

      addEvent: (ticketId, notes) => {
        set((state) => ({
          events: [
            {
              id: id(),
              ticketId,
              actor: "Teknisi NOC",
              action: "note",
              notes,
              createdAt: now(),
            },
            ...state.events,
          ],
        }));
      },

      transition: (ticketId, status, notes) => {
        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === ticketId ? { ...ticket, status } : ticket
          ),
          events: [
            {
              id: id(),
              ticketId,
              actor: "Teknisi NOC",
              action: status,
              notes,
              createdAt: now(),
            },
            ...state.events,
          ],
        }));
        audit("ticket.status_changed", ticketId, `Status tiket menjadi ${status}.`);
      },

      closeTicket: (ticketId, notes) => {
        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === ticketId
              ? {
                  ...ticket,
                  status: "closed",
                  closedAt: now().slice(0, 10),
                }
              : ticket
          ),
          events: [
            {
              id: id(),
              ticketId,
              actor: "Customer Service",
              action: "closed",
              notes,
              createdAt: now(),
            },
            ...state.events,
          ],
        }));
        audit("ticket.closed", ticketId, "Tiket ditutup.");
      },

      resetTickets: () => set({ tickets: seedTickets, events: seedTicketEvents }),
    }),
    { name: "muranet-tickets", skipHydration: true }
  )
);
