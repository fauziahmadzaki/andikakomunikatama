import type { Metadata } from "next";

import { NotificationsPage } from "@/features/notifications/components/NotificationsPage";

export const metadata: Metadata = { title: "Notifikasi · MURANET" };

export default function NotificationsRoute() {
  return <NotificationsPage />;
}
