"use client";

import type { Dispatch, SetStateAction } from "react";

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

export type CustomerEditForm = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  notes: string;
};

export function CustomerEditDialog({
  open,
  form,
  setForm,
  onClose,
  onSave,
}: {
  open: boolean;
  form: CustomerEditForm;
  setForm: Dispatch<SetStateAction<CustomerEditForm>>;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>Edit pelanggan</DialogTitle>
        <DialogDescription>
          Perubahan akan tercatat di audit log.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <Field>
          <FieldLabel htmlFor="edit-name">Nama lengkap</FieldLabel>
          <Input
            id="edit-name"
            value={form.fullName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                fullName: event.target.value,
              }))
            }
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="edit-phone">Telepon</FieldLabel>
            <Input
              id="edit-phone"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="edit-email">Email</FieldLabel>
            <Input
              id="edit-email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="edit-address">Alamat</FieldLabel>
          <Textarea
            id="edit-address"
            value={form.address}
            rows={2}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                address: event.target.value,
              }))
            }
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="edit-city">Kota</FieldLabel>
            <Input
              id="edit-city"
              value={form.city}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  city: event.target.value,
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="edit-province">Provinsi</FieldLabel>
            <Input
              id="edit-province"
              value={form.province}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  province: event.target.value,
                }))
              }
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="edit-notes">Catatan</FieldLabel>
          <Textarea
            id="edit-notes"
            value={form.notes}
            rows={2}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                notes: event.target.value,
              }))
            }
          />
        </Field>
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
