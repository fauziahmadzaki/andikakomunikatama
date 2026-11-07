import type { Metadata } from "next";

import { CustomersPage } from "@/features/customers/components/CustomersPage";

export const metadata: Metadata = {
  title: "Pelanggan · MURANET",
};

export default function CustomersRoute() {
  return <CustomersPage />;
}
