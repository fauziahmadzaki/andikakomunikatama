import type { Metadata } from "next";

import { CoaPage } from "@/features/finance/components/CoaPage";

export const metadata: Metadata = { title: "Chart of Accounts · MURANET" };

export default function CoaRoute() {
  return <CoaPage />;
}
