"use client";

import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  CustomerContact,
  CustomerIdentity,
} from "@/features/customers/data/types";

const contactTypeLabel: Record<CustomerContact["contactType"], string> = {
  phone: "Telepon",
  whatsapp: "WhatsApp",
  email: "Email",
};

const identityTypeLabel: Record<CustomerIdentity["identityType"], string> = {
  ktp: "KTP",
  sim: "SIM",
  ktm: "KTM",
  npwp: "NPWP",
  passport: "Passport",
};

export function CustomerContactsTab({
  contacts,
  identities,
  onAddContact,
  onEditContact,
  onDeleteContact,
  onAddIdentity,
  onEditIdentity,
  onDeleteIdentity,
}: {
  contacts: CustomerContact[];
  identities: CustomerIdentity[];
  onAddContact: () => void;
  onEditContact: (contact: CustomerContact) => void;
  onDeleteContact: (contact: CustomerContact) => void;
  onAddIdentity: () => void;
  onEditIdentity: (identity: CustomerIdentity) => void;
  onDeleteIdentity: (identity: CustomerIdentity) => void;
}) {
  const contactColumns: DataTableColumn<CustomerContact>[] = [
    {
      key: "contactType",
      header: "Tipe",
      cell: (contact) => (
        <StatusBadge tone="primary">
          {contactTypeLabel[contact.contactType]}
        </StatusBadge>
      ),
    },
    {
      key: "value",
      header: "Nilai",
      cell: (contact) => (
        <span className="font-medium">{contact.value}</span>
      ),
    },
    {
      key: "isPrimary",
      header: "Utama",
      cell: (contact) =>
        contact.isPrimary ? (
          <StatusBadge tone="success">Utama</StatusBadge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "isVerified",
      header: "Verifikasi",
      cell: (contact) => (
        <StatusBadge tone={contact.isVerified ? "success" : "warning"}>
          {contact.isVerified ? "Terverifikasi" : "Belum"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (contact) => (
        <div className="flex justify-end gap-1">
          <ActionIconButton
            icon={PencilIcon}
            label="Edit kontak"
            onPress={() => onEditContact(contact)}
          />
          <ActionIconButton
            icon={Trash2Icon}
            label="Hapus kontak"
            tone="destructive"
            onPress={() => onDeleteContact(contact)}
          />
        </div>
      ),
    },
  ];

  const identityColumns: DataTableColumn<CustomerIdentity>[] = [
    {
      key: "identityType",
      header: "Tipe",
      cell: (identity) => (
        <StatusBadge tone="primary">
          {identityTypeLabel[identity.identityType]}
        </StatusBadge>
      ),
    },
    {
      key: "identityNumber",
      header: "Nomor",
      cell: (identity) => (
        <span className="font-mono text-xs">{identity.identityNumber}</span>
      ),
    },
    {
      key: "fileId",
      header: "File",
      cell: (identity) => (
        <span className="text-xs text-muted-foreground">
          {identity.fileName ?? identity.fileId ?? "Belum ada"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (identity) => (
        <div className="flex justify-end gap-1">
          <ActionIconButton
            icon={PencilIcon}
            label="Edit identitas"
            onPress={() => onEditIdentity(identity)}
          />
          <ActionIconButton
            icon={Trash2Icon}
            label="Hapus identitas"
            tone="destructive"
            onPress={() => onDeleteIdentity(identity)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="gap-0 py-0">
        <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
          <CardTitle>Kontak</CardTitle>
          <Button size="sm" onPress={onAddContact}>
            <PlusIcon />
            Tambah kontak
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable
            data={contacts}
            columns={contactColumns}
            getRowKey={(contact) => contact.id}
            ariaLabel="Kontak pelanggan"
            emptyMessage="Belum ada kontak."
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
          <CardTitle>Identitas</CardTitle>
          <Button size="sm" onPress={onAddIdentity}>
            <PlusIcon />
            Tambah identitas
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable
            data={identities}
            columns={identityColumns}
            getRowKey={(identity) => identity.id}
            ariaLabel="Identitas pelanggan"
            emptyMessage="Belum ada identitas."
          />
        </CardContent>
      </Card>
    </div>
  );
}
