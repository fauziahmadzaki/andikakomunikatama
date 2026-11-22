import type { Metadata } from "next";

import { PreviewPage } from "@/features/preview/components/PreviewPage";

export const metadata: Metadata = {
  title: "Design system · MURANET",
};

export default function PreviewRoutePage() {
  return <PreviewPage />;
}
