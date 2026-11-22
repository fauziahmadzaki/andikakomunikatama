import type { Metadata } from "next";

import { NetworkIncidentsPage } from "@/features/network/components/NetworkIncidentsPage";

export const metadata: Metadata = { title: "Gangguan Jaringan · MURANET" };

export default function NetworkIncidentsRoute() {
  return <NetworkIncidentsPage />;
}
