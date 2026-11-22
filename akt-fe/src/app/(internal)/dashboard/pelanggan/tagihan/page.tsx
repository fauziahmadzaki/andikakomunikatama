import type { Metadata } from "next";

import { InvoicesPage } from "@/features/billing/components/InvoicesPage";

export const metadata: Metadata = { title: "Tagihan Pelanggan · MURANET" };

export default function CustomerInvoicesRoute() {
  return <InvoicesPage />;
}
