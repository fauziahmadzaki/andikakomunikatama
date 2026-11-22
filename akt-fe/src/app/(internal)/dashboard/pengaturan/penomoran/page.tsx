import type { Metadata } from "next";

import { SequencesPage } from "@/features/sequences/components/SequencesPage";

export const metadata: Metadata = {
  title: "Penomoran · MURANET",
};

export default function SequencesRoute() {
  return <SequencesPage />;
}
