import type { Metadata } from "next";

import { RoutersPage } from "@/features/network/components/RoutersPage";

export const metadata: Metadata = { title: "Router · MURANET" };

export default function RoutersRoute() {
  return <RoutersPage />;
}
