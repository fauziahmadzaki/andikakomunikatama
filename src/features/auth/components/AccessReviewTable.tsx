"use client";

import { CheckIcon, ShieldXIcon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { roleLabels, type LocalUser } from "@/features/auth/data/users";

function formatDate(value: string | null) {
  if (!value) {
    return "Belum pernah";
  }
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function AccessReviewTable({
  users,
  reviewed,
  onReview,
  onRevoke,
}: {
  users: LocalUser[];
  reviewed: string[];
  onReview: (id: string) => void;
  onRevoke: (user: LocalUser) => void;
}) {
  const columns: DataTableColumn<LocalUser>[] = [
    {
      key: "name",
      header: "Pengguna",
      cell: (user) => (
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (user) => (
        <StatusBadge tone={user.role === "admin" ? "warning" : "primary"}>
          {roleLabels[user.role]}
        </StatusBadge>
      ),
    },
    {
      key: "branchName",
      header: "Cabang",
      cell: (user) => (
        <span className="text-muted-foreground">{user.branchName}</span>
      ),
    },
    {
      key: "lastLoginAt",
      header: "Login terakhir",
      cell: (user) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(user.lastLoginAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (user) => (
        <StatusBadge tone={user.status === "active" ? "success" : "danger"}>
          {user.status === "active" ? "Aktif" : "Nonaktif"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (user) => (
        <div className="flex justify-end gap-1">
          <ActionIconButton
            icon={CheckIcon}
            label={
              reviewed.includes(user.id)
                ? "Batalkan tanda review"
                : "Tandai sudah direview"
            }
            onPress={() => onReview(user.id)}
          />
          {user.status === "active" ? (
            <ActionIconButton
              icon={ShieldXIcon}
              label="Cabut akses"
              tone="destructive"
              onPress={() => onRevoke(user)}
            />
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      getRowKey={(user) => user.id}
      ariaLabel="Access review"
      emptyMessage="Tidak ada pengguna."
    />
  );
}
