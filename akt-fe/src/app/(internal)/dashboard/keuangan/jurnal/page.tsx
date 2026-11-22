import type { Metadata } from "next";

import { JournalPage } from "@/features/finance/components/JournalPage";

export const metadata: Metadata = { title: "Jurnal · MURANET" };

export default function JournalRoute() {
  return <JournalPage />;
}
