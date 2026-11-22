import type { Metadata } from "next";

import { NotificationLogPage } from "@/features/notifications/components/NotificationLogPage";

export const metadata: Metadata = { title: "Log Notifikasi · MURANET" };

export default function NotificationLogRoute() {
  return <NotificationLogPage />;
}
