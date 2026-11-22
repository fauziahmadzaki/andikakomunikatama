import type { Metadata } from "next";

import { TicketsPage } from "@/features/tickets/components/TicketsPage";

export const metadata: Metadata = { title: "Tiket · MURANET" };

export default function TicketsRoute() {
  return <TicketsPage />;
}
