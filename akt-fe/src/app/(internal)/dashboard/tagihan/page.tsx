import type { Metadata } from "next";

import { InvoicesPage } from "@/features/billing/components/InvoicesPage";

export const metadata: Metadata = { title: "Tagihan · MURANET" };

export default function InvoicesRoute() {
  return <InvoicesPage />;
}
