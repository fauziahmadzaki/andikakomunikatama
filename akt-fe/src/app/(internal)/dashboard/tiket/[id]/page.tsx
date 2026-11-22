import type { Metadata } from "next";

import { TicketDetailPage } from "@/features/tickets/components/TicketDetailPage";

export const metadata: Metadata = { title: "Detail Tiket · MURANET" };

export default async function TicketDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketDetailPage id={id} />;
}
