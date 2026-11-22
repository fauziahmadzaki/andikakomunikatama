export type TicketStatus = "open" | "in_progress" | "pending" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";

export type Ticket = {
  id: string;
  number: string;
  customerId?: string;
  customerName: string;
  category: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  branchName: string;
  technician: string;
  createdAt: string;
  closedAt?: string;
};

export type TicketEvent = {
  id: string;
  ticketId: string;
  actor: string;
  action: string;
  notes: string;
  createdAt: string;
};
