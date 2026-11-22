import type { Metadata } from "next";

import { RouterDashboardPage } from "@/features/network/components/RouterDashboardPage";

export const metadata: Metadata = { title: "Dashboard Router · MURANET" };

export default async function RouterDashboardRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RouterDashboardPage key={id} id={id} />;
}
