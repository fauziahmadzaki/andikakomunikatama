import type { Metadata } from "next";

import { SequencesPage } from "@/features/foundation/components/SequencesPage";

export const metadata: Metadata = {
  title: "Penomoran · MURANET",
};

export default function SequencesRoute() {
  return <SequencesPage />;
}
