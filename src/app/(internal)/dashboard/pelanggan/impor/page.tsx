import type { Metadata } from "next";

import { CustomerImportPage } from "@/features/customers/components/CustomerImportPage";

export const metadata: Metadata = {
  title: "Impor Pelanggan · MURANET",
};

export default function CustomerImportRoute() {
  return <CustomerImportPage />;
}
