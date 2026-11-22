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
import { useCredentialRotation } from "@/features/network/hooks/useCredentialRotation";

export function CredentialRotateDialog({
  device,
  onClose,
}: {
  device: { id: string; name: string; type: "router" | "olt" } | null;
  onClose: () => void;
}) {
  const { secret, setSecret, save } = useCredentialRotation({ device, onClose });

  return (
    <Dialog
      isOpen={Boolean(device)}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <DialogHeader>
        <DialogTitle>Rotasi credential</DialogTitle>
        <DialogDescription>
          {device?.name} · secret lama akan diganti setelah test berhasil.
        </DialogDescription>
      </DialogHeader>
      <Field>
        <FieldLabel htmlFor="new-secret">Secret baru</FieldLabel>
        <Input
          id="new-secret"
          type="password"
          value={secret}
          placeholder="Minimal 6 karakter"
          onChange={(event) => setSecret(event.target.value)}
        />
      </Field>
      <DialogFooter>
        <Button variant="outline" onPress={onClose}>
          Batal
        </Button>
        <Button onPress={save}>Rotasi</Button>
      </DialogFooter>
    </Dialog>
  );
}
