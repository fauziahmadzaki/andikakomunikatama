import type { Metadata } from "next";

import { PlanProfileWizard } from "@/features/plan-profiles/components/PlanProfileWizard";

export const metadata: Metadata = {
  title: "Edit Paket · MURANET",
};

export default async function PackageEditRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PlanProfileWizard profileId={id} />;
}
