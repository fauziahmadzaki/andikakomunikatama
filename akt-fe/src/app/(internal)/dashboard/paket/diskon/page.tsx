import type { Metadata } from "next";

import { DiscountsPage } from "@/features/catalog/components/DiscountsPage";

export const metadata: Metadata = {
  title: "Diskon · MURANET",
};

export default function DiscountsRoute() {
  return <DiscountsPage />;
}
