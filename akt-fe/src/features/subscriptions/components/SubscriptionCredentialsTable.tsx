"use client";

import { KeyRoundIcon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ServiceCredential } from "@/features/subscriptions/data/types";

export function SubscriptionCredentialsTable({
  credentials,
  onRotate,
}: {
  credentials: ServiceCredential[];
  onRotate: (credential: ServiceCredential) => void;
}) {
  const columns: DataTableColumn<ServiceCredential>[] = [
    {
      key: "credentialType",
      header: "Tipe",
      cell: (credential) => (
        <StatusBadge tone="primary">{credential.credentialType}</StatusBadge>
      ),
    },
    {
      key: "username",
      header: "Username",
      cell: (credential) => (
        <span className="font-mono text-xs">{credential.username}</span>
      ),
    },
    {
      key: "secretRef",
      header: "Secret ref",
      cell: (credential) => (
        <span className="font-mono text-xs text-muted-foreground">
          {credential.secretRef}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      cell: (credential) => (
        <StatusBadge tone={credential.isActive ? "success" : "neutral"}>
          {credential.isActive ? "Aktif" : "Nonaktif"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (credential) => (
        <ActionIconButton
          icon={KeyRoundIcon}
          label="Rotasi credential"
          onPress={() => onRotate(credential)}
        />
      ),
    },
  ];

  return (
    <DataTable
      data={credentials}
      columns={columns}
      getRowKey={(credential) => credential.id}
      ariaLabel="Credential service"
      emptyMessage="Belum ada credential."
    />
  );
}
