"use client";

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
import type {
  Olt,
  PassiveDevice,
  PassiveDeviceType,
  Pole,
} from "@/features/network/data/types";

export type PassiveDeviceForm = {
  code: string;
  name: string;
  type: PassiveDeviceType;
  branchId: string;
  parentDeviceId: string;
  oltId: string;
  poleId: string;
  capacity: string;
  usedCapacity: string;
  latitude: string;
  longitude: string;
};

export function PassiveDeviceDialog({
  open,
  form,
  set,
  branches,
  devices,
  olts,
  poles,
  isEditing,
  onSave,
  onClose,
}: {
  open: boolean;
  form: PassiveDeviceForm;
  set: (key: keyof PassiveDeviceForm, value: string) => void;
  branches: { id: string; name: string }[];
  devices: PassiveDevice[];
  olts: Olt[];
  poles: Pole[];
  isEditing: boolean;
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
        <DialogTitle>
          {isEditing ? "Edit perangkat pasif" : "Tambah perangkat pasif"}
        </DialogTitle>
        <DialogDescription>
          ODP/ODC mendukung parent-child, OLT, tiang, dan kapasitas port.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="passive-code">Kode</FieldLabel>
            <Input
              id="passive-code"
              value={form.code}
              placeholder="ODP-JKT-021"
              onChange={(event) => set("code", event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="passive-name">Nama</FieldLabel>
            <Input
              id="passive-name"
              value={form.name}
              onChange={(event) => set("name", event.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Tipe</p>
            <SelectField
              value={form.type}
              onValueChange={(value) => set("type", value)}
              ariaLabel="Tipe perangkat"
              options={[
                { value: "odp", label: "ODP" },
                { value: "odc", label: "ODC" },
                { value: "splitter", label: "Splitter" },
                { value: "switch", label: "Switch" },
                { value: "otb", label: "OTB" },
                { value: "joint_closure", label: "Joint Closure" },
              ]}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Cabang</p>
            <SelectField
              value={form.branchId}
              onValueChange={(value) => set("branchId", value)}
              ariaLabel="Cabang perangkat"
              options={branches.map((branch) => ({
                value: branch.id,
                label: branch.name,
              }))}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Parent device</p>
            <SelectField
              value={form.parentDeviceId}
              onValueChange={(value) => set("parentDeviceId", value)}
              ariaLabel="Parent device"
              options={[
                { value: "", label: "Tanpa parent" },
                ...devices.map((device) => ({
                  value: device.id,
                  label: `${device.code} · ${device.name}`,
                })),
              ]}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">OLT</p>
            <SelectField
              value={form.oltId}
              onValueChange={(value) => set("oltId", value)}
              ariaLabel="OLT perangkat"
              options={[
                { value: "", label: "Tanpa OLT" },
                ...olts.map((olt) => ({
                  value: olt.id,
                  label: olt.name,
                })),
              ]}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Tiang</p>
            <SelectField
              value={form.poleId}
              onValueChange={(value) => set("poleId", value)}
              ariaLabel="Tiang perangkat"
              options={[
                { value: "", label: "Tanpa tiang" },
                ...poles.map((pole) => ({
                  value: pole.id,
                  label: `${pole.code} · ${pole.name}`,
                })),
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="passive-capacity">Kapasitas</FieldLabel>
              <Input
                id="passive-capacity"
                type="number"
                value={form.capacity}
                onChange={(event) => set("capacity", event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="passive-used">Terpakai</FieldLabel>
              <Input
                id="passive-used"
                type="number"
                value={form.usedCapacity}
                onChange={(event) => set("usedCapacity", event.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="passive-lat">Latitude</FieldLabel>
            <Input
              id="passive-lat"
              value={form.latitude}
              onChange={(event) => set("latitude", event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="passive-lng">Longitude</FieldLabel>
            <Input
              id="passive-lng"
              value={form.longitude}
              onChange={(event) => set("longitude", event.target.value)}
            />
          </Field>
        </div>
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
