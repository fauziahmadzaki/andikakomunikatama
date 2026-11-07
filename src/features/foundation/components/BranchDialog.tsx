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
import type { Branch } from "@/features/foundation/data/types";
import { useBranchDialog } from "@/features/foundation/hooks/useBranchDialog";

export function BranchDialog({
  open,
  branch,
  onClose,
}: {
  open: boolean;
  branch: Branch | null;
  onClose: () => void;
}) {
  const { form, set, save, isEditing } = useBranchDialog({ branch, onClose });

  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit cabang" : "Tambah cabang"}</DialogTitle>
        <DialogDescription>
          Kode cabang tidak dapat diubah setelah dibuat.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="branch-code">Kode</FieldLabel>
            <Input
              id="branch-code"
              value={form.code}
              disabled={isEditing}
              placeholder="JKT-02"
              onChange={(event) => set("code", event.target.value.toUpperCase())}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="branch-name">Nama cabang</FieldLabel>
            <Input
              id="branch-name"
              value={form.name}
              placeholder="Jakarta Selatan"
              onChange={(event) => set("name", event.target.value)}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="branch-phone">Telepon</FieldLabel>
          <Input
            id="branch-phone"
            value={form.phone}
            placeholder="+62 21 ..."
            onChange={(event) => set("phone", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="branch-address">Alamat</FieldLabel>
          <Textarea
            id="branch-address"
            value={form.address}
            rows={2}
            onChange={(event) => set("address", event.target.value)}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isHeadOffice}
            onChange={(event) => set("isHeadOffice", event.target.checked)}
            className="size-4 rounded border-input accent-primary"
          />
          Jadikan kantor pusat
        </label>
      </div>

      <DialogFooter>
        <Button variant="outline" onPress={onClose}>
          Batal
        </Button>
        <Button onPress={save}>Simpan</Button>
      </DialogFooter>
    </Dialog>
  );
}
