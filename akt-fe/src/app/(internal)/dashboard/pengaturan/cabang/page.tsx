import type { Metadata } from "next";

import { BranchesPage } from "@/features/branches/components/BranchesPage";

export const metadata: Metadata = {
  title: "Cabang · MURANET",
};

export default function BranchesRoute() {
  return <BranchesPage />;
}
