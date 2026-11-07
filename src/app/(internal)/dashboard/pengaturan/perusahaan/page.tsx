import type { Metadata } from "next";

import { CompanyProfilePage } from "@/features/foundation/components/CompanyProfilePage";

export const metadata: Metadata = {
  title: "Profil Perusahaan · MURANET",
};

export default function CompanyProfileRoute() {
  return <CompanyProfilePage />;
}
