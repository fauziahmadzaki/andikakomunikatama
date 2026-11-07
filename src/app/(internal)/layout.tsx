import type { ReactNode } from "react";

import { SessionGuard } from "@/features/auth/components/SessionGuard";

export default function InternalLayout({ children }: { children: ReactNode }) {
  return <SessionGuard>{children}</SessionGuard>;
}
