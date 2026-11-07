import type { Metadata } from "next";

import { AccessReviewPage } from "@/features/auth/components/AccessReviewPage";

export const metadata: Metadata = {
  title: "Access Review · MURANET",
};

export default function AccessReviewRoute() {
  return <AccessReviewPage />;
}
