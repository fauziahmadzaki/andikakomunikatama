import type { Metadata } from "next";

import { BillingRunPage } from "@/features/billing/components/BillingRunPage";

export const metadata: Metadata = {
  title: "Tagih Manual · MURANET",
};

export default function ManualBillingRoute() {
  return <BillingRunPage />;
}
