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
import type {
  InventoryItem,
  InventoryStatus,
  MovementType,
} from "@/features/network/data/types";

export function InventoryItemDialog({
  open,
  form,
  setForm,
  branches,
  onSave,
  onClose,
}: {
  open: boolean;
  form: {
    sku: string;
    name: string;
    category: string;
    serialNumber: string;
    mac: string;
    branchId: string;
    status: InventoryStatus;
    purchasePrice: string;
    purchasedAt: string;
    notes: string;
  };
  setForm: Dispatch<SetStateAction<typeof form>>;
  branches: { id: string; name: string }[];
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      isOpen={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      className="max-w-lg"
    >
      <DialogHeader>
        <DialogTitle>Tambah inventaris</DialogTitle>
        <DialogDescription>
          Barang disimpan sebagai unit serialized.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="inv-sku">SKU</FieldLabel>
            <Input
              id="inv-sku"
              value={form.sku}
              onChange={(event) =>
                setForm((current) => ({ ...current, sku: event.target.value }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="inv-name">Nama barang</FieldLabel>
            <Input
              id="inv-name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="inv-serial">Serial number</FieldLabel>
            <Input
              id="inv-serial"
              value={form.serialNumber}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  serialNumber: event.target.value,
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="inv-mac">MAC (opsional)</FieldLabel>
            <Input
              id="inv-mac"
              value={form.mac}
              onChange={(event) =>
                setForm((current) => ({ ...current, mac: event.target.value }))
              }
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="inv-category">Kategori</FieldLabel>
            <Input
              id="inv-category"
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
            />
          </Field>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Cabang</p>
            <SelectField
              value={form.branchId}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, branchId: value }))
              }
              ariaLabel="Cabang inventaris"
              options={branches.map((branch) => ({
                value: branch.id,
                label: branch.name,
              }))}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="inv-price">Harga beli</FieldLabel>
            <Input
              id="inv-price"
              type="number"
              value={form.purchasePrice}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  purchasePrice: event.target.value,
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="inv-date">Tanggal beli</FieldLabel>
            <Input
              id="inv-date"
              type="date"
              value={form.purchasedAt}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  purchasedAt: event.target.value,
                }))
              }
            />
          </Field>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Status</p>
            <SelectField
              value={form.status}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  status: value as InventoryStatus,
                }))
              }
              ariaLabel="Status inventaris"
              options={[
                { value: "in_stock", label: "In stock" },
                { value: "installed", label: "Installed" },
                { value: "returned", label: "Returned" },
                { value: "damaged", label: "Damaged" },
                { value: "retired", label: "Retired" },
              ]}
            />
          </div>
        </div>
        <Field>
          <FieldLabel htmlFor="inv-notes">Catatan</FieldLabel>
          <Textarea
            id="inv-notes"
            rows={2}
            value={form.notes}
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

export function InventoryMovementDialog({
  item,
  form,
  setForm,
  branches,
  employees,
  onSave,
  onClose,
}: {
  item: InventoryItem | null;
  form: {
    type: MovementType;
    reference: string;
    fromBranchId: string;
    toBranchId: string;
    employeeId: string;
    notes: string;
  };
  setForm: Dispatch<SetStateAction<typeof form>>;
  branches: { id: string; name: string }[];
  employees: { id: string; fullName: string }[];
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      isOpen={Boolean(item)}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <DialogHeader>
        <DialogTitle>Catat movement</DialogTitle>
        <DialogDescription>
          {item?.name} · {item?.serialNumber}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Tipe movement</p>
          <SelectField
            value={form.type}
            onValueChange={(value) =>
              setForm((current) => ({ ...current, type: value as MovementType }))
            }
            ariaLabel="Tipe movement"
            options={[
              { value: "in", label: "Masuk" },
              { value: "out", label: "Keluar" },
              { value: "transfer", label: "Transfer" },
              { value: "adjustment", label: "Adjustment" },
              { value: "installed", label: "Installed" },
              { value: "returned", label: "Returned" },
            ]}
          />
        </div>
        <Field>
          <FieldLabel htmlFor="movement-reference">Referensi</FieldLabel>
          <Input
            id="movement-reference"
            value={form.reference}
            placeholder="SUB-2026-000001"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                reference: event.target.value,
              }))
            }
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Cabang asal</p>
            <SelectField
              value={form.fromBranchId}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, fromBranchId: value }))
              }
              ariaLabel="Cabang asal"
              options={branches.map((branch) => ({
                value: branch.id,
                label: branch.name,
              }))}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Cabang tujuan</p>
            <SelectField
              value={form.toBranchId}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, toBranchId: value }))
              }
              ariaLabel="Cabang tujuan"
              options={branches.map((branch) => ({
                value: branch.id,
                label: branch.name,
              }))}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Petugas</p>
          <SelectField
            value={form.employeeId}
            onValueChange={(value) =>
              setForm((current) => ({ ...current, employeeId: value }))
            }
            ariaLabel="Petugas movement"
            options={[
              { value: "", label: "Tanpa petugas" },
              ...employees.map((employee) => ({
                value: employee.id,
                label: employee.fullName,
              })),
            ]}
          />
        </div>
        <Field>
          <FieldLabel htmlFor="movement-notes">Catatan</FieldLabel>
          <Textarea
            id="movement-notes"
            rows={2}
            value={form.notes}
            onChange={(event) =>
              setForm((current) => ({ ...current, notes: event.target.value }))
            }
          />
        </Field>
      </div>

      <DialogFooter>
        <Button variant="outline" onPress={onClose}>
          Batal
        </Button>
        <Button onPress={onSave}>Simpan movement</Button>
      </DialogFooter>
    </Dialog>
  );
}
