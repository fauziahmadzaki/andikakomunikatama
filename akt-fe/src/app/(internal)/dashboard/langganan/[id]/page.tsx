import type { Metadata } from "next";

import { SubscriptionDetailPage } from "@/features/subscriptions/components/SubscriptionDetailPage";

export const metadata: Metadata = {
  title: "Detail Langganan · MURANET",
};

export default async function SubscriptionDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <SubscriptionDetailPage id={id} />;
}
