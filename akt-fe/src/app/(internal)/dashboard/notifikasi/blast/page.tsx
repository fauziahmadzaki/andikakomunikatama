import type { Metadata } from "next";

import { BlastPage } from "@/features/notifications/components/BlastPage";

export const metadata: Metadata = { title: "Blast Notifikasi · MURANET" };

export default function BlastRoute() {
  return <BlastPage />;
}
