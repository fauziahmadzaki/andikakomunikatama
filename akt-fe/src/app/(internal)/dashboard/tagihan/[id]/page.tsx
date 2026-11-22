import type { Metadata } from "next";

import { InvoiceDetailPage } from "@/features/billing/components/InvoiceDetailPage";

export const metadata: Metadata = { title: "Detail Invoice · MURANET" };

export default async function InvoiceDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InvoiceDetailPage id={id} />;
}
