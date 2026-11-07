import type { Metadata } from "next";

import { SettingsPage } from "@/features/foundation/components/SettingsPage";

export const metadata: Metadata = {
  title: "Pengaturan Sistem · MURANET",
};

export default function SettingsRoute() {
  return <SettingsPage />;
}
