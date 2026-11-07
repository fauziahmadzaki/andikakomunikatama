"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { NumberSequence } from "@/features/foundation/data/types";

export function SequenceDialog({
  sequence,
  form,
  onFormChange,
  onSave,
  onClose,
}: {
  sequence: NumberSequence | null;
  form: { prefix: string; nextNumber: number; padding: number };
  onFormChange: (form: { prefix: string; nextNumber: number; padding: number }) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const preview = `${form.prefix}-2026-${String(form.nextNumber).padStart(
    form.padding,
    "0"
  )}`;

  return (
    <Dialog isOpen={Boolean(sequence)} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>Edit penomoran</DialogTitle>
        <DialogDescription>
          Perubahan berlaku untuk dokumen berikutnya.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="seq-prefix">Prefix</FieldLabel>
          <Input
            id="seq-prefix"
            value={form.prefix}
            onChange={(event) =>
              onFormChange({
                ...form,
                prefix: event.target.value.toUpperCase(),
              })
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="seq-next">Nomor berikutnya</FieldLabel>
          <Input
            id="seq-next"
            type="number"
            value={form.nextNumber}
            onChange={(event) =>
              onFormChange({ ...form, nextNumber: Number(event.target.value) })
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="seq-padding">Padding</FieldLabel>
          <Input
            id="seq-padding"
            type="number"
            value={form.padding}
            onChange={(event) =>
              onFormChange({ ...form, padding: Number(event.target.value) })
            }
          />
        </Field>
      </div>

      <div className="rounded-lg bg-muted/50 px-3 py-2 font-mono text-xs text-muted-foreground">
        {preview}
      </div>

      <DialogFooter>
        <Button variant="outline" onPress={onClose}>
          Batal
        </Button>
        <Button onPress={onSave}>Simpan</Button>
      </DialogFooter>
    </Dialog>
  );
}
