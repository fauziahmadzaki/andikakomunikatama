import type { Metadata } from "next";

import { CustomerSegmentsPage } from "@/features/customers/components/CustomerSegmentsPage";

export const metadata: Metadata = {
  title: "Segmen Pelanggan · MURANET",
};

export default function CustomerSegmentsRoute() {
  return <CustomerSegmentsPage />;
}
