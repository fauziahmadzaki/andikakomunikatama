"use client";

import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerAddress } from "@/features/customers/data/types";

const addressTypeLabel: Record<CustomerAddress["addressType"], string> = {
  home: "Rumah",
  office: "Kantor",
  installation: "Instalasi",
};

export function CustomerAddressesTab({
  addresses,
  onAdd,
  onEdit,
  onDelete,
}: {
  addresses: CustomerAddress[];
  onAdd: () => void;
  onEdit: (address: CustomerAddress) => void;
  onDelete: (address: CustomerAddress) => void;
}) {
  const columns: DataTableColumn<CustomerAddress>[] = [
    {
      key: "addressType",
      header: "Tipe",
      cell: (address) => (
        <StatusBadge tone={address.isPrimary ? "success" : "neutral"}>
          {addressTypeLabel[address.addressType]}
        </StatusBadge>
      ),
    },
    {
      key: "addressLine",
      header: "Alamat",
      cell: (address) => (
        <div>
          <p className="font-medium">{address.addressLine}</p>
          <p className="text-xs text-muted-foreground">
            {address.village}, {address.district}, {address.city},{" "}
            {address.province} {address.postalCode}
          </p>
        </div>
      ),
    },
    {
      key: "primary",
      header: "Utama",
      cell: (address) =>
        address.isPrimary ? (
          <StatusBadge tone="success">Utama</StatusBadge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "coordinates",
      header: "Koordinat",
      cell: (address) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {address.latitude ?? "-"}, {address.longitude ?? "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (address) => (
        <div className="flex justify-end gap-1">
          <ActionIconButton
            icon={PencilIcon}
            label="Edit alamat"
            onPress={() => onEdit(address)}
          />
          <ActionIconButton
            icon={Trash2Icon}
            label="Hapus alamat"
            tone="destructive"
            onPress={() => onDelete(address)}
          />
        </div>
      ),
    },
  ];

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
        <CardTitle>Alamat pelanggan</CardTitle>
        <Button size="sm" onPress={onAdd}>
          <PlusIcon />
          Tambah alamat
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <DataTable
          data={addresses}
          columns={columns}
          getRowKey={(address) => address.id}
          ariaLabel="Alamat pelanggan"
          emptyMessage="Belum ada alamat."
        />
      </CardContent>
    </Card>
  );
}
