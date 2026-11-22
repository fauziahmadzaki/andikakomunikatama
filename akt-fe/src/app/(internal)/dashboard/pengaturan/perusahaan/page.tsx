import type { Metadata } from "next";

import { CompanyProfilePage } from "@/features/company/components/CompanyProfilePage";

export const metadata: Metadata = {
  title: "Profil Perusahaan · MURANET",
};

export default function CompanyProfileRoute() {
  return <CompanyProfilePage />;
}
