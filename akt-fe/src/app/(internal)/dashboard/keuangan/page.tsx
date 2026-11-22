import type { Metadata } from "next";

import { FinanceOverviewPage } from "@/features/finance/components/FinanceOverviewPage";

export const metadata: Metadata = { title: "Keuangan · MURANET" };

export default function FinanceRoute() {
  return <FinanceOverviewPage />;
}
