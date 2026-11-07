"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useSequencesPage } from "@/features/foundation/hooks/useSequencesPage";
import { SequenceDialog } from "./SequenceDialog";
import { SequencesTable } from "./SequencesTable";

export function SequencesPage() {
  const { sequences, editing, form, setForm, openEdit, close, save } =
    useSequencesPage();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        title="Penomoran dokumen"
        description="Nomor dibuat transaksional dan tidak pernah dipakai ulang."
      />

      <Card className="gap-0 py-0">
        <CardContent className="p-4">
          <SequencesTable sequences={sequences} onEdit={openEdit} />
        </CardContent>
      </Card>

      <SequenceDialog
        sequence={editing}
        form={form}
        onFormChange={(next) => setForm(next)}
        onSave={save}
        onClose={close}
      />
    </div>
  );
}
