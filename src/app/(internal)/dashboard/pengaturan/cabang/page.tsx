import type { Metadata } from "next";

import { BranchesPage } from "@/features/foundation/components/BranchesPage";

export const metadata: Metadata = {
  title: "Cabang · MURANET",
};

export default function BranchesRoute() {
  return <BranchesPage />;
}
