import type { Metadata } from "next";

import { MigrationPage } from "@/features/migration/components/MigrationPage";

export const metadata: Metadata = { title: "Migrasi & Cutover · MURANET" };

export default function MigrationRoute() {
  return <MigrationPage />;
}
