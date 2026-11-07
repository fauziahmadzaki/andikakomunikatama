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
import { Textarea } from "@/components/ui/textarea";

export function CustomerSegmentDialog({
  open,
  form,
  onFormChange,
  onSave,
  onClose,
}: {
  open: boolean;
  form: { name: string; description: string; filterLabel: string };
  onFormChange: (form: {
    name: string;
    description: string;
    filterLabel: string;
  }) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>Buat segmen</DialogTitle>
        <DialogDescription>
          Segmen dipakai oleh notifikasi dan laporan.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <Field>
          <FieldLabel htmlFor="segment-name">Nama segmen</FieldLabel>
          <Input
            id="segment-name"
            value={form.name}
            placeholder="Contoh: Belum lunas November"
            onChange={(event) =>
              onFormChange({ ...form, name: event.target.value })
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="segment-description">Deskripsi</FieldLabel>
          <Textarea
            id="segment-description"
            rows={2}
            value={form.description}
            onChange={(event) =>
              onFormChange({ ...form, description: event.target.value })
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="segment-filter">Filter</FieldLabel>
          <Input
            id="segment-filter"
            value={form.filterLabel}
            placeholder="Outstanding > 0"
            onChange={(event) =>
              onFormChange({ ...form, filterLabel: event.target.value })
            }
          />
        </Field>
      </div>

      <DialogFooter>
        <Button variant="outline" onPress={onClose}>
          Batal
        </Button>
        <Button onPress={onSave}>Simpan segmen</Button>
      </DialogFooter>
    </Dialog>
  );
}
