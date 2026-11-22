import type { Metadata } from "next";

import { UsersPage } from "@/features/users/components/UsersPage";

export const metadata: Metadata = {
  title: "Pengguna · MURANET",
};

export default function UsersRoute() {
  return <UsersPage />;
}
