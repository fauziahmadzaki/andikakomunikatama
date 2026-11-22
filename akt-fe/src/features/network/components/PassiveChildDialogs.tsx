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

export type PoleForm = {
  code: string;
  name: string;
  branchId: string;
  latitude: string;
  longitude: string;
  address: string;
};

export type AntennaForm = {
  name: string;
  branchId: string;
  routerId: string;
  mac: string;
  ip: string;
  ssid: string;
  frequency: string;
  channel: string;
};

export type TunnelForm = {
  name: string;
  routerId: string;
  username: string;
  isActive: boolean;
};

export function PoleDialog({
  open,
  form,
  setForm,
  branches,
  isEditing,
  onSave,
  onClose,
}: {
  open: boolean;
  form: PoleForm;
  setForm: Dispatch<SetStateAction<PoleForm>>;
  branches: { id: string; name: string }[];
  isEditing: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit tiang" : "Tambah tiang"}</DialogTitle>
        <DialogDescription>Tiang disimpan di tabel `poles`.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="pole-code">Kode</FieldLabel>
            <Input
              id="pole-code"
              value={form.code}
              onChange={(event) =>
                setForm((current) => ({ ...current, code: event.target.value }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pole-name">Nama</FieldLabel>
            <Input
              id="pole-name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </Field>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Cabang</p>
          <SelectField
            value={form.branchId}
            onValueChange={(value) =>
              setForm((current) => ({ ...current, branchId: value }))
            }
            ariaLabel="Cabang tiang"
            options={branches.map((branch) => ({
              value: branch.id,
              label: branch.name,
            }))}
          />
        </div>
        <Field>
          <FieldLabel htmlFor="pole-address">Alamat</FieldLabel>
          <Input
            id="pole-address"
            value={form.address}
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
            <FieldLabel htmlFor="pole-lat">Latitude</FieldLabel>
            <Input
              id="pole-lat"
              value={form.latitude}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  latitude: event.target.value,
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pole-lng">Longitude</FieldLabel>
            <Input
              id="pole-lng"
              value={form.longitude}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  longitude: event.target.value,
                }))
              }
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

export function AntennaDialog({
  open,
  form,
  setForm,
  branches,
  routers,
  isEditing,
  onSave,
  onClose,
}: {
  open: boolean;
  form: AntennaForm;
  setForm: Dispatch<SetStateAction<AntennaForm>>;
  branches: { id: string; name: string }[];
  routers: { id: string; name: string }[];
  isEditing: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit antena" : "Tambah antena"}
        </DialogTitle>
        <DialogDescription>
          Antena terhubung ke router dan cabang.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <Field>
          <FieldLabel htmlFor="antenna-name">Nama</FieldLabel>
          <Input
            id="antenna-name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Cabang</p>
            <SelectField
              value={form.branchId}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, branchId: value }))
              }
              ariaLabel="Cabang antena"
              options={branches.map((branch) => ({
                value: branch.id,
                label: branch.name,
              }))}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Router</p>
            <SelectField
              value={form.routerId}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, routerId: value }))
              }
              ariaLabel="Router antena"
              options={routers.map((router) => ({
                value: router.id,
                label: router.name,
              }))}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="antenna-mac">MAC</FieldLabel>
            <Input
              id="antenna-mac"
              value={form.mac}
              onChange={(event) =>
                setForm((current) => ({ ...current, mac: event.target.value }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="antenna-ip">IP</FieldLabel>
            <Input
              id="antenna-ip"
              value={form.ip}
              onChange={(event) =>
                setForm((current) => ({ ...current, ip: event.target.value }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="antenna-ssid">SSID</FieldLabel>
            <Input
              id="antenna-ssid"
              value={form.ssid}
              onChange={(event) =>
                setForm((current) => ({ ...current, ssid: event.target.value }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="antenna-frequency">Frekuensi</FieldLabel>
            <Input
              id="antenna-frequency"
              value={form.frequency}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  frequency: event.target.value,
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="antenna-channel">Channel</FieldLabel>
            <Input
              id="antenna-channel"
              value={form.channel}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  channel: event.target.value,
                }))
              }
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

export function TunnelDialog({
  open,
  form,
  setForm,
  routers,
  isEditing,
  onSave,
  onClose,
}: {
  open: boolean;
  form: TunnelForm;
  setForm: Dispatch<SetStateAction<TunnelForm>>;
  routers: { id: string; name: string }[];
  isEditing: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit tunnel" : "Tambah tunnel"}
        </DialogTitle>
        <DialogDescription>
          Tunnel VPN terhubung ke router.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <Field>
          <FieldLabel htmlFor="tunnel-name">Nama</FieldLabel>
          <Input
            id="tunnel-name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
          />
        </Field>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Router</p>
          <SelectField
            value={form.routerId}
            onValueChange={(value) =>
              setForm((current) => ({ ...current, routerId: value }))
            }
            ariaLabel="Router tunnel"
            options={routers.map((router) => ({
              value: router.id,
              label: router.name,
            }))}
          />
        </div>
        <Field>
          <FieldLabel htmlFor="tunnel-username">Username</FieldLabel>
          <Input
            id="tunnel-username"
            value={form.username}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                username: event.target.value,
              }))
            }
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                isActive: event.target.checked,
              }))
            }
            className="size-4 rounded border-input accent-primary"
          />
          Aktif
        </label>
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
