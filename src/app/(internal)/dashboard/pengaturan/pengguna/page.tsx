import type { Metadata } from "next";

import { UsersPage } from "@/features/auth/components/UsersPage";

export const metadata: Metadata = {
  title: "Pengguna · MURANET",
};

export default function UsersRoute() {
  return <UsersPage />;
}
