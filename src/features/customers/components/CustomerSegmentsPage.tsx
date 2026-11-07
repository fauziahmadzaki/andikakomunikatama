"use client";

import { PlusIcon } from "lucide-react";

import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCustomerSegments } from "@/features/customers/hooks/useCustomerSegments";
import { CustomerSegmentDialog } from "./CustomerSegmentDialog";
import { CustomerSegmentsTable } from "./CustomerSegmentsTable";

export function CustomerSegmentsPage() {
  const {
    segments,
    open,
    setOpen,
    form,
    setForm,
    confirmSegment,
    setConfirmSegment,
    save,
    confirmDelete,
  } = useCustomerSegments();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        title="Segmen pelanggan"
        description="Simpan filter pelanggan untuk kampanye dan laporan."
      >
        <Button onPress={() => setOpen(true)}>
          <PlusIcon />
          Buat segmen
        </Button>
      </PageHeader>

      <Card className="gap-0 py-0">
        <CardContent className="p-4">
          <CustomerSegmentsTable
            segments={segments}
            onDelete={setConfirmSegment}
          />
        </CardContent>
      </Card>

      <CustomerSegmentDialog
        open={open}
        form={form}
        onFormChange={(next) => setForm(next)}
        onSave={save}
        onClose={() => setOpen(false)}
      />

      <ConfirmationDialog
        open={Boolean(confirmSegment)}
        title="Hapus segmen?"
        description={`Segmen ${confirmSegment?.name ?? ""} akan dihapus.`}
        confirmLabel="Hapus"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setConfirmSegment(null)}
      />
    </div>
  );
}
