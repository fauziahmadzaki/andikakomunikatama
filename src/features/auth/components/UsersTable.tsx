"use client";

import { BanIcon, CheckCircleIcon, PencilIcon } from "lucide-react";

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
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function UsersTable({
  users,
  onEdit,
  onToggle,
}: {
  users: LocalUser[];
  onEdit: (user: LocalUser) => void;
  onToggle: (user: LocalUser) => void;
}) {
  const columns: DataTableColumn<LocalUser>[] = [
    {
      key: "name",
      header: "Pengguna",
      cell: (user) => (
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {user.name
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </span>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (user) => (
        <StatusBadge tone="primary">{roleLabels[user.role]}</StatusBadge>
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
      key: "twoFactorEnabled",
      header: "2FA",
      cell: (user) => (
        <StatusBadge tone={user.twoFactorEnabled ? "success" : "neutral"}>
          {user.twoFactorEnabled ? "Aktif" : "Tidak"}
        </StatusBadge>
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
            icon={PencilIcon}
            label="Edit pengguna"
            onPress={() => onEdit(user)}
          />
          <ActionIconButton
            icon={user.status === "active" ? BanIcon : CheckCircleIcon}
            label={user.status === "active" ? "Nonaktifkan pengguna" : "Aktifkan pengguna"}
            tone={user.status === "active" ? "destructive" : "default"}
            onPress={() => onToggle(user)}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      getRowKey={(user) => user.id}
      ariaLabel="Daftar pengguna"
      emptyMessage="Tidak ada pengguna yang cocok."
    />
  );
}
