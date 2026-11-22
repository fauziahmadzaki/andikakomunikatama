import type { Metadata } from "next";

import { NetworkOverviewPage } from "@/features/network/components/NetworkOverviewPage";

export const metadata: Metadata = {
  title: "Jaringan · MURANET",
};

export default function NetworkOverviewRoute() {
  return <NetworkOverviewPage />;
}
