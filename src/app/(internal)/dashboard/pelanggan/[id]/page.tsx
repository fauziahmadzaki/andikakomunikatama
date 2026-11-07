import type { Metadata } from "next";

import { CustomerDetailPage } from "@/features/customers/components/CustomerDetailPage";

export const metadata: Metadata = {
  title: "Detail Pelanggan · MURANET",
};

export default async function CustomerDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CustomerDetailPage id={id} />;
}
