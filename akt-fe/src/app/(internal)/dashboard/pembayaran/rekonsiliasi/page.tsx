import type { Metadata } from "next";

import { ReconciliationPage } from "@/features/payments/components/ReconciliationPage";

export const metadata: Metadata = { title: "Rekonsiliasi · MURANET" };

export default function ReconciliationRoute() {
  return <ReconciliationPage />;
}
