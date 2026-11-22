import type { Metadata } from "next";

import { AccessReviewPage } from "@/features/users/components/AccessReviewPage";

export const metadata: Metadata = {
  title: "Access Review · MURANET",
};

export default function AccessReviewRoute() {
  return <AccessReviewPage />;
}
