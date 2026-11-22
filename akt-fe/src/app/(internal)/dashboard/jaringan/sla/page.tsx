import type { Metadata } from "next";
import { SlaMonitoringPage } from "@/features/network/sla/components/SlaMonitoringPage";

export const metadata: Metadata = {
  title: "Monitoring SLA & Netwatch · MURANET",
};

export default function SlaMonitoringRoute() {
  return <SlaMonitoringPage />;
}
