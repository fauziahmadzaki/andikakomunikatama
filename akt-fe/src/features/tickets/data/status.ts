import type { StatusTone } from "@/components/shared/StatusBadge";

import type { TicketStatus } from "./types";

export const ticketStatusTone: Record<TicketStatus, StatusTone> = {
  open: "primary",
  in_progress: "warning",
  pending: "neutral",
  closed: "success",
};
