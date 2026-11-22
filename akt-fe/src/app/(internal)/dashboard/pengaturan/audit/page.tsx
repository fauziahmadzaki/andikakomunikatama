import type { Metadata } from "next";

import { AuditLogPage } from "@/features/audit/components/AuditLogPage";

export const metadata: Metadata = {
  title: "Audit Log · MURANET",
};

export default function AuditLogRoute() {
  return <AuditLogPage />;
}
