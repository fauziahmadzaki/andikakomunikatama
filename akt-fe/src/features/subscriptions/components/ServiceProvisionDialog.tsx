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
  CredentialType,
  ServiceType,
} from "@/features/subscriptions/data/types";
import { useServiceProvision } from "@/features/subscriptions/hooks/useServiceProvision";

export function ServiceProvisionDialog({
  open,
  subscriptionId,
  branchId,
  onClose,
}: {
  open: boolean;
  subscriptionId: string;
  branchId: string;
  onClose: () => void;
}) {
  const { routers, olts, passiveDevices, form, set, save } =
    useServiceProvision({
      subscriptionId,
      branchId,
      onClose,
    });

  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>Tambah service</DialogTitle>
        <DialogDescription>
          Service disimpan sebagai pending sampai provisioning berhasil.
          Credential disimpan terpisah dengan secret reference.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Tipe service</p>
            <SelectField
              value={form.serviceType}
              onValueChange={(value) => set("serviceType", value as ServiceType)}
              ariaLabel="Tipe service"
              options={[
                { value: "pppoe", label: "PPPoE" },
                { value: "hotspot", label: "Hotspot" },
                { value: "static", label: "Static" },
                { value: "iptv", label: "IPTV" },
              ]}
            />
          </div>
          <Field>
            <FieldLabel htmlFor="service-username">Username</FieldLabel>
            <Input
              id="service-username"
              value={form.username}
              placeholder="nama@muranet"
              onChange={(event) => set("username", event.target.value)}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Router</p>
            <SelectField
              value={form.routerId}
              onValueChange={(value) => set("routerId", value)}
              ariaLabel="Router service"
              options={routers.map((router) => ({
                value: router.id,
                label: router.name,
              }))}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">OLT</p>
            <SelectField
              value={form.oltId}
              onValueChange={(value) => set("oltId", value)}
              ariaLabel="OLT service"
              options={[
                { value: "", label: "Tanpa OLT" },
                ...olts.map((olt) => ({ value: olt.id, label: olt.name })),
              ]}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">ODP</p>
          <SelectField
            value={form.passiveDeviceId}
            onValueChange={(value) => set("passiveDeviceId", value)}
            ariaLabel="ODP service"
            options={[
              { value: "", label: "Tanpa ODP" },
              ...passiveDevices.map((device) => ({
                value: device.id,
                label: `${device.code} · ${device.name}`,
              })),
            ]}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Tipe credential</p>
            <SelectField
              value={form.credentialType}
              onValueChange={(value) =>
                set("credentialType", value as CredentialType)
              }
              ariaLabel="Tipe credential"
              options={[
                { value: "pppoe", label: "PPPoE" },
                { value: "hotspot", label: "Hotspot" },
                { value: "static", label: "Static" },
              ]}
            />
          </div>
          <Field>
            <FieldLabel htmlFor="service-secret">Secret reference</FieldLabel>
            <Input
              id="service-secret"
              value={form.secretRef}
              placeholder="secret/service/..."
              onChange={(event) => set("secretRef", event.target.value)}
            />
          </Field>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onPress={onClose}>
          Batal
        </Button>
        <Button onPress={save}>Simpan service</Button>
      </DialogFooter>
    </Dialog>
  );
}
