import type { Metadata } from "next";

import { IntegrationsPage } from "@/features/integrations/components/IntegrationsPage";

export const metadata: Metadata = { title: "Integrasi · MURANET" };

export default function IntegrationsRoute() {
  return <IntegrationsPage />;
}
