import type { Metadata } from "next";

import { PassiveDevicesPage } from "@/features/network/components/PassiveDevicesPage";

export const metadata: Metadata = {
  title: "Perangkat Jaringan · MURANET",
};

export default function PassiveDevicesRoute() {
  return <PassiveDevicesPage />;
}
