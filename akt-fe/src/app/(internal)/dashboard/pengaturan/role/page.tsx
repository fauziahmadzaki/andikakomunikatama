import type { Metadata } from "next";

import { RoleMatrix } from "@/features/users/components/RoleMatrix";

export const metadata: Metadata = {
  title: "Role & Akses · MURANET",
};

export default function RolesRoute() {
  return <RoleMatrix />;
}
