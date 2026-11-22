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

export function CredentialRotateDialog({
  open,
  username,
  secret,
  onSecretChange,
  onSave,
  onClose,
}: {
  open: boolean;
  username: string;
  secret: string;
  onSecretChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>Rotasi credential</DialogTitle>
        <DialogDescription>
          Secret baru untuk {username} disimpan sebagai secret reference.
        </DialogDescription>
      </DialogHeader>
      <Field>
        <FieldLabel htmlFor="credential-secret">Secret baru</FieldLabel>
        <Input
          id="credential-secret"
          value={secret}
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
