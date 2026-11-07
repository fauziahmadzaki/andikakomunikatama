import type { Metadata } from "next";

import { AuditLogPage } from "@/features/foundation/components/AuditLogPage";

export const metadata: Metadata = {
  title: "Audit Log · MURANET",
};

export default function AuditLogRoute() {
  return <AuditLogPage />;
}
