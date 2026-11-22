import type { Metadata } from "next";

import { TechnicianSchedulePage } from "@/features/tickets/components/TechnicianSchedulePage";

export const metadata: Metadata = { title: "Jadwal Teknisi · MURANET" };

export default function TechnicianScheduleRoute() {
  return <TechnicianSchedulePage />;
}
