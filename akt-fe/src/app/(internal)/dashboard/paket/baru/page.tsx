import type { Metadata } from "next";

import { PlanProfileWizard } from "@/features/plan-profiles/components/PlanProfileWizard";

export const metadata: Metadata = {
  title: "Tambah Paket · MURANET",
};

export default function PackageCreateRoute() {
  return <PlanProfileWizard />;
}
