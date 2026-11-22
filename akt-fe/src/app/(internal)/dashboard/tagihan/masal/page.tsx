import type { Metadata } from "next";

import { BulkBillingPage } from "@/features/billing/components/BulkBillingPage";

export const metadata: Metadata = {
  title: "Tagih Masal · MURANET",
};

export default function BulkBillingRoute() {
  return <BulkBillingPage />;
}
