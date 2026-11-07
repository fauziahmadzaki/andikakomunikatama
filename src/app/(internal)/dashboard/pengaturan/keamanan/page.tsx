import type { Metadata } from "next";

import { SecurityPage } from "@/features/foundation/components/SecurityPage";

export const metadata: Metadata = {
  title: "Keamanan · MURANET",
};

export default function SecurityRoute() {
  return <SecurityPage />;
}
