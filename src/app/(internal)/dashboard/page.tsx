import type { Metadata } from "next";

import { DashboardHome } from "@/features/dashboard/components/DashboardHome";

export const metadata: Metadata = {
  title: "Dashboard · MURANET",
};

export default function DashboardPage() {
  return <DashboardHome />;
}
