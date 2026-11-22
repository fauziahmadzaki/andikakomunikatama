import type { Metadata } from "next";

import { PaymentsPage } from "@/features/payments/components/PaymentsPage";

export const metadata: Metadata = { title: "Pembayaran layanan · MURANET" };

export default function PaymentsRoute() {
  return <PaymentsPage />;
}
