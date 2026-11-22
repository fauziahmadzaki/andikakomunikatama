import type { Metadata } from "next";
import { TelegramSettingsPage } from "@/features/settings/components/TelegramSettingsPage";

export const metadata: Metadata = {
  title: "Pengaturan Telegram · AKT",
};

export default function TelegramSettingsRoute() {
  return <TelegramSettingsPage />;
}
