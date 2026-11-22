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
import type { DeviceStatus, Router } from "@/features/network/data/types";
import { useOltDialog } from "@/features/network/hooks/useOltDialog";
import { useRouterDialog } from "@/features/network/hooks/useRouterDialog";

export function RouterDialog({
  open,
  router,
  onClose,
}: {
  open: boolean;
  router?: Router | null;
  onClose: () => void;
}) {
  const {
    branches,
    form,
    set,
    save,
    testConnection,
    isTesting,
    isSaving,
    isEditing,
  } = useRouterDialog({
    router,
    onClose,
  });

  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit router" : "Tambah router"}</DialogTitle>
        <DialogDescription>
          Port API dapat dikustomisasi (default: 8728). Password disimpan aman di backend dan tidak ditampilkan kembali di frontend.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <Field>
          <FieldLabel htmlFor="router-name">Nama router</FieldLabel>
          <Input
            id="router-name"
            value={form.name}
            placeholder="JKT-RTR-03"
            onChange={(event) => set("name", event.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Lokasi / cabang</p>
            <SelectField
              value={form.branchId}
              onValueChange={(value) => set("branchId", value)}
              ariaLabel="Cabang router"
              options={branches.map((branch) => ({
                value: branch.id,
                label: branch.name,
              }))}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Status</p>
            <SelectField
              value={form.status}
              onValueChange={(value) => set("status", value as DeviceStatus)}
              ariaLabel="Status router"
              options={[
                { value: "active", label: "Aktif" },
                { value: "inactive", label: "Nonaktif" },
                { value: "maintenance", label: "Maintenance" },
                { value: "retired", label: "Retired" },
              ]}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="router-host">IP address / Host</FieldLabel>
            <Input
              id="router-host"
              value={form.host}
              placeholder="10.10.1.3"
              onChange={(event) => set("host", event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="router-port">Port API</FieldLabel>
            <Input
              id="router-port"
              type="number"
              value={form.apiPort}
              placeholder="8728"
              onChange={(event) => set("apiPort", event.target.value)}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="router-username">User</FieldLabel>
            <Input
              id="router-username"
              value={form.username}
              placeholder="admin"
              onChange={(event) => set("username", event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="router-password">Password user</FieldLabel>
            <Input
              id="router-password"
              type="password"
              value={form.password}
              placeholder={
                isEditing
                  ? "Kosongkan jika tidak ingin mengubah password"
                  : "Masukkan password router"
              }
              onChange={(event) => set("password", event.target.value)}
            />
          </Field>
        </div>
      </div>
      <DialogFooter className="flex flex-wrap items-center justify-between gap-2 sm:justify-between">
        <Button
          variant="outline"
          onPress={testConnection}
          isDisabled={isTesting || isSaving}
        >
          {isTesting ? "Mengecek koneksi..." : "Test Koneksi"}
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onPress={onClose} isDisabled={isSaving}>
            Batal
          </Button>
          <Button onPress={save} isDisabled={isSaving}>
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}

export function OltDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { branches, form, set, save } = useOltDialog({ onClose });

  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>Tambah OLT</DialogTitle>
        <DialogDescription>
          Konfigurasi Telnet/SNMP dan secret reference.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="olt-name">Nama OLT</FieldLabel>
            <Input
              id="olt-name"
              value={form.name}
              placeholder="JKT-OLT-02"
              onChange={(event) => set("name", event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="olt-model">Model</FieldLabel>
            <Input
              id="olt-model"
              value={form.model}
              onChange={(event) => set("model", event.target.value)}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Cabang</p>
            <SelectField
              value={form.branchId}
              onValueChange={(value) => set("branchId", value)}
              ariaLabel="Cabang OLT"
              options={branches.map((branch) => ({
                value: branch.id,
                label: branch.name,
              }))}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Vendor</p>
            <SelectField
              value={form.vendor}
              onValueChange={(value) => set("vendor", value)}
              ariaLabel="Vendor OLT"
              options={[
                { value: "ZTE", label: "ZTE" },
                { value: "HUAWEI", label: "Huawei" },
                { value: "HSGQ", label: "HSGQ" },
                { value: "HIOSO", label: "Hioso" },
                { value: "C-DATA", label: "C-Data" },
              ]}
            />
          </div>
        </div>
        <Field>
          <FieldLabel htmlFor="olt-host">Host</FieldLabel>
          <Input
            id="olt-host"
            value={form.host}
            placeholder="10.10.2.2"
            onChange={(event) => set("host", event.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="olt-telnet">Telnet port</FieldLabel>
            <Input
              id="olt-telnet"
              type="number"
              value={form.telnetPort}
              onChange={(event) => set("telnetPort", event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="olt-snmp">SNMP port</FieldLabel>
            <Input
              id="olt-snmp"
              type="number"
              value={form.snmpPort}
              onChange={(event) => set("snmpPort", event.target.value)}
            />
          </Field>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">SNMP version</p>
            <SelectField
              value={form.snmpVersion}
              onValueChange={(value) => set("snmpVersion", value)}
              ariaLabel="SNMP version"
              options={[
                { value: "1", label: "1" },
                { value: "2c", label: "2c" },
              ]}
            />
          </div>
        </div>
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
