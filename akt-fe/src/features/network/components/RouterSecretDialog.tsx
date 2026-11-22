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

export function RouterSecretDialog({
  open,
  routerName,
  secret,
  onSecretChange,
  onSave,
  onClose,
}: {
  open: boolean;
  routerName: string;
  secret: string;
  onSecretChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>Rotasi password router</DialogTitle>
        <DialogDescription>
          Password baru untuk {routerName} akan disimpan sebagai secret
          reference, bukan plaintext.
        </DialogDescription>
      </DialogHeader>
      <Field>
        <FieldLabel htmlFor="router-new-secret">Password baru</FieldLabel>
        <Input
          id="router-new-secret"
          type="password"
          value={secret}
          placeholder="Minimal 6 karakter"
          onChange={(event) => onSecretChange(event.target.value)}
        />
      </Field>
      <DialogFooter>
        <Button variant="outline" onPress={onClose}>
          Batal
        </Button>
        <Button onPress={onSave}>Simpan</Button>
      </DialogFooter>
    </Dialog>
  );
}
