"use client";

import type { Dispatch, SetStateAction } from "react";

import { SelectField } from "@/components/shared/SelectField";
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
import type { CustomerType, RegistrationType } from "@/features/customers/data/types";
import type { CustomerEditForm } from "@/features/customers/hooks/useCustomerDetail";
import type { Branch } from "@/features/branches/data/branches";
import type { Employee } from "@/features/users/data/employees";

export function CustomerEditDialog({
  open,
  form,
  setForm,
  branches,
  employees,
  onClose,
  onSave,
}: {
  open: boolean;
  form: CustomerEditForm;
  setForm: Dispatch<SetStateAction<CustomerEditForm>>;
  branches: Branch[];
  employees: Employee[];
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>Edit pelanggan</DialogTitle>
        <DialogDescription>
          Perubahan header pelanggan akan tercatat di audit log. Alamat, kontak,
          dan identitas dikelola dari tab masing-masing.
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
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Jenis pelanggan</p>
            <SelectField
              value={form.registrationType}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  registrationType: value as RegistrationType,
                }))
              }
              ariaLabel="Jenis pelanggan"
              options={[
                { value: "new", label: "Baru" },
                { value: "existing", label: "Lama" },
                { value: "survey", label: "Survey" },
              ]}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Tipe pelanggan</p>
            <SelectField
              value={form.customerType}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  customerType: value as CustomerType,
                }))
              }
              ariaLabel="Tipe pelanggan"
              options={[
                { value: "residential", label: "Residensial" },
                { value: "business", label: "Bisnis" },
              ]}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Cabang</p>
            <SelectField
              value={form.branchId}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, branchId: value }))
              }
              ariaLabel="Cabang pelanggan"
              options={branches.map((branch) => ({
                value: branch.id,
                label: branch.name,
              }))}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Sales</p>
          <SelectField
            value={form.salesEmployeeId}
            onValueChange={(value) =>
              setForm((current) => ({ ...current, salesEmployeeId: value }))
            }
            ariaLabel="Sales pelanggan"
            options={[
              { value: "", label: "Tanpa sales" },
              ...employees.map((employee) => ({
                value: employee.id,
                label: `${employee.fullName} · ${employee.position}`,
              })),
            ]}
          />
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
