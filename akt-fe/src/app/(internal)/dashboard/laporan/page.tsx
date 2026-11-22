import type { Metadata } from "next";

import { ReportsPage } from "@/features/reports/components/ReportsPage";

export const metadata: Metadata = { title: "Laporan · MURANET" };

export default function ReportsRoute() {
  return <ReportsPage />;
}
