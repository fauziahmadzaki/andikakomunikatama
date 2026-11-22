"use client";

import {
  BanIcon,
  CheckCircleIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatBandwidth } from "@/features/plan-profiles/data/bandwidth";
import type { PlanProfile } from "@/features/plan-profiles/data/types";
import { formatRupiah } from "@/lib/format";

export function PlanProfilesTable({
  profiles,
  routerName,
  poolName,
  queueName,
  onEdit,
  onToggle,
  onDelete,
}: {
  profiles: PlanProfile[];
  routerName: (routerId: string) => string;
  poolName: (poolId: string) => string;
  queueName: (queueId: string) => string;
  onEdit?: (profile: PlanProfile) => void;
  onToggle: (profile: PlanProfile) => void;
  onDelete: (profile: PlanProfile) => void;
}) {
  const columns: DataTableColumn<PlanProfile>[] = [
    {
      key: "name",
      header: "Paket",
      cell: (profile) => (
        <div>
          <p className="font-medium">{profile.name}</p>
          <p className="text-xs text-muted-foreground">
            {profile.description || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Tipe",
      cell: (profile) => (
        <StatusBadge
          tone={
            profile.type === "pppoe"
              ? "primary"
              : profile.type === "hotspot"
                ? "warning"
                : "neutral"
          }
        >
          {profile.type === "pppoe"
            ? "PPPoE"
            : profile.type === "hotspot"
              ? "Hotspot"
              : "Lainnya"}
        </StatusBadge>
      ),
    },
    {
      key: "price",
      header: "Harga",
      cell: (profile) => (
        <span className="font-medium">{formatRupiah(profile.price)}</span>
      ),
    },
    {
      key: "routerId",
      header: "Router",
      cell: (profile) => (
        <span className="text-muted-foreground">
          {routerName(profile.routerId)}
        </span>
      ),
    },
    {
      key: "ipPoolId",
      header: "IP pool",
      cell: (profile) => (
        <span className="font-mono text-xs text-muted-foreground">
          {poolName(profile.ipPoolId)}
        </span>
      ),
    },
    {
      key: "parentQueueId",
      header: "Parent queue",
      cell: (profile) => (
        <span className="font-mono text-xs text-muted-foreground">
          {queueName(profile.parentQueueId)}
        </span>
      ),
    },
    {
      key: "bandwidth",
      header: "Bandwidth",
      cell: (profile) => (
        <div>
          <p className="text-sm">
            MIR {formatBandwidth(profile.mirDownloadMbps)} /{" "}
            {formatBandwidth(profile.mirUploadMbps)}
          </p>
          <p className="text-xs text-muted-foreground">
            CIR {formatBandwidth(profile.cirDownloadMbps)} /{" "}
            {formatBandwidth(profile.cirUploadMbps)}
          </p>
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      cell: (profile) => (
        <StatusBadge tone={profile.isActive ? "success" : "neutral"}>
          {profile.isActive ? "Aktif" : "Nonaktif"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (profile) => (
        <div className="flex justify-end gap-1">
          {onEdit ? (
            <ActionIconButton
              icon={PencilIcon}
              label={`Edit ${profile.name}`}
              onPress={() => onEdit(profile)}
            />
          ) : null}
          <ActionIconButton
            icon={profile.isActive ? BanIcon : CheckCircleIcon}
            label={
              profile.isActive
                ? `Nonaktifkan ${profile.name}`
                : `Aktifkan ${profile.name}`
            }
            tone={profile.isActive ? "destructive" : "default"}
            onPress={() => onToggle(profile)}
          />
          <ActionIconButton
            icon={Trash2Icon}
            label={`Hapus ${profile.name}`}
            tone="destructive"
            onPress={() => onDelete(profile)}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={profiles}
      columns={columns}
      getRowKey={(profile) => profile.id}
      ariaLabel="Daftar paket"
      emptyMessage="Belum ada paket."
    />
  );
}
