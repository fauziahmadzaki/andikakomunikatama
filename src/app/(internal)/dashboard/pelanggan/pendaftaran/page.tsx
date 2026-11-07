import type { Metadata } from "next";

import { CustomerWizard } from "@/features/customers/components/CustomerWizard";

export const metadata: Metadata = {
  title: "Pendaftaran Pelanggan · MURANET",
};

export default function CustomerRegistrationPage() {
  return <CustomerWizard />;
}
