import type { Metadata } from "next";

import { TopologyPage } from "@/features/network/components/TopologyPage";

export const metadata: Metadata = {
  title: "Topologi · MURANET",
};

export default function TopologyRoute() {
  return <TopologyPage />;
}
