import type { Metadata } from "next";

import { PlanProfilesPage } from "@/features/plan-profiles/components/PlanProfilesPage";

export const metadata: Metadata = {
  title: "Paket · MURANET",
};

export default function PackagesRoute() {
  return <PlanProfilesPage />;
}
