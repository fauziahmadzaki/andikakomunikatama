import type { Metadata } from "next";

import { InventoryPage } from "@/features/network/components/InventoryPage";

export const metadata: Metadata = {
  title: "Inventaris · MURANET",
};

export default function InventoryRoute() {
  return <InventoryPage />;
}
