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
import type {
  AddressType,
  ContactType,
  IdentityType,
} from "@/features/customers/data/types";
import type {
  CustomerAccountForm,
  CustomerAddressForm,
  CustomerContactForm,
  CustomerIdentityForm,
} from "@/features/customers/hooks/useCustomerDetail";

export function CustomerAddressDialog({
  open,
  form,
  setForm,
  isEditing,
  onSave,
  onClose,
}: {
  open: boolean;
  form: CustomerAddressForm;
  setForm: Dispatch<SetStateAction<CustomerAddressForm>>;
  isEditing: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit alamat" : "Tambah alamat"}</DialogTitle>
        <DialogDescription>
          Alamat disimpan di `customer_addresses`.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Tipe alamat</p>
          <SelectField
            value={form.addressType}
            onValueChange={(value) =>
              setForm((current) => ({
                ...current,
                addressType: value as AddressType,
              }))
            }
            ariaLabel="Tipe alamat"
            options={[
              { value: "home", label: "Rumah" },
              { value: "office", label: "Kantor" },
              { value: "installation", label: "Instalasi" },
            ]}
          />
        </div>
        <Field>
          <FieldLabel htmlFor="customer-address-line">Alamat</FieldLabel>
          <Input
            id="customer-address-line"
            value={form.addressLine}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                addressLine: event.target.value,
              }))
            }
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="customer-village">Kelurahan</FieldLabel>
            <Input
              id="customer-village"
              value={form.village}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  village: event.target.value,
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="customer-district">Kecamatan</FieldLabel>
            <Input
              id="customer-district"
              value={form.district}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  district: event.target.value,
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="customer-city">Kota/Kabupaten</FieldLabel>
            <Input
              id="customer-city"
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
            <FieldLabel htmlFor="customer-province">Provinsi</FieldLabel>
            <Input
              id="customer-province"
              value={form.province}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  province: event.target.value,
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="customer-postal">Kode pos</FieldLabel>
            <Input
              id="customer-postal"
              value={form.postalCode}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  postalCode: event.target.value,
                }))
              }
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="customer-latitude">Latitude</FieldLabel>
            <Input
              id="customer-latitude"
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
            <FieldLabel htmlFor="customer-longitude">Longitude</FieldLabel>
            <Input
              id="customer-longitude"
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
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPrimary}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                isPrimary: event.target.checked,
              }))
            }
            className="size-4 rounded border-input accent-primary"
          />
          Jadikan alamat utama
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

export function CustomerContactDialog({
  open,
  form,
  setForm,
  isEditing,
  onSave,
  onClose,
}: {
  open: boolean;
  form: CustomerContactForm;
  setForm: Dispatch<SetStateAction<CustomerContactForm>>;
  isEditing: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit kontak" : "Tambah kontak"}
        </DialogTitle>
        <DialogDescription>
          Kontak disimpan di `customer_contacts`.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Tipe kontak</p>
          <SelectField
            value={form.contactType}
            onValueChange={(value) =>
              setForm((current) => ({
                ...current,
                contactType: value as ContactType,
              }))
            }
            ariaLabel="Tipe kontak"
            options={[
              { value: "phone", label: "Telepon" },
              { value: "whatsapp", label: "WhatsApp" },
              { value: "email", label: "Email" },
            ]}
          />
        </div>
        <Field>
          <FieldLabel htmlFor="customer-contact-value">Nilai</FieldLabel>
          <Input
            id="customer-contact-value"
            value={form.value}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                value: event.target.value,
              }))
            }
          />
        </Field>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPrimary}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isPrimary: event.target.checked,
                }))
              }
              className="size-4 rounded border-input accent-primary"
            />
            Kontak utama
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isVerified}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isVerified: event.target.checked,
                }))
              }
              className="size-4 rounded border-input accent-primary"
            />
            Terverifikasi
          </label>
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

export function CustomerIdentityDialog({
  open,
  form,
  setForm,
  isEditing,
  onSave,
  onClose,
}: {
  open: boolean;
  form: CustomerIdentityForm;
  setForm: Dispatch<SetStateAction<CustomerIdentityForm>>;
  isEditing: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit identitas" : "Tambah identitas"}
        </DialogTitle>
        <DialogDescription>
          Identitas disimpan di `customer_identities`.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Tipe identitas</p>
          <SelectField
            value={form.identityType}
            onValueChange={(value) =>
              setForm((current) => ({
                ...current,
                identityType: value as IdentityType,
              }))
            }
            ariaLabel="Tipe identitas"
            options={[
              { value: "ktp", label: "KTP" },
              { value: "sim", label: "SIM" },
              { value: "ktm", label: "KTM" },
              { value: "npwp", label: "NPWP" },
              { value: "passport", label: "Passport" },
            ]}
          />
        </div>
        <Field>
          <FieldLabel htmlFor="customer-identity-number">Nomor identitas</FieldLabel>
          <Input
            id="customer-identity-number"
            value={form.identityNumber}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                identityNumber: event.target.value,
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

export function CustomerAccountDialog({
  open,
  form,
  setForm,
  onSave,
  onClose,
}: {
  open: boolean;
  form: CustomerAccountForm;
  setForm: Dispatch<SetStateAction<CustomerAccountForm>>;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>Akun portal</DialogTitle>
        <DialogDescription>
          Akun pelanggan disimpan di `customer_accounts`.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <Field>
          <FieldLabel htmlFor="customer-account-email">Email</FieldLabel>
          <Input
            id="customer-account-email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="customer-account-phone">Telepon</FieldLabel>
          <Input
            id="customer-account-phone"
            value={form.phone}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                phone: event.target.value,
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
          Akun aktif
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
