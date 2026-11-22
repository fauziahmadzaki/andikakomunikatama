import type { Metadata } from "next";

import { CashPage } from "@/features/finance/components/CashPage";

export const metadata: Metadata = { title: "Kas · MURANET" };

export default function CashRoute() {
  return <CashPage />;
}
