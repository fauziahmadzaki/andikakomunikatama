"use client";

import {
  ActivityIcon,
  EyeIcon,
  KeyRoundIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge";
import { useBranchStore } from "@/features/branches/store/branch-store";
import type { DeviceStatus } from "@/features/network/data/types";
import type { RouterRow } from "@/features/network/hooks/useRoutersPage";
import { formatDateTime } from "@/lib/format";

const statusTone: Record<DeviceStatus, StatusTone> = {
  active: "success",
  inactive: "neutral",
  maintenance: "warning",
  retired: "neutral",
};

export function RoutersTable({
  routers,
  onView,
  onEdit,
  onTest,
  onRotate,
  onDelete,
}: {
  routers: RouterRow[];
  onView: (router: RouterRow) => void;
  onEdit: (router: RouterRow) => void;
  onTest: (router: RouterRow) => void;
  onRotate: (router: RouterRow) => void;
  onDelete: (router: RouterRow) => void;
}) {
  const branches = useBranchStore((state) => state.branches);

  const columns: DataTableColumn<RouterRow>[] = [
    {
      key: "name",
      header: "Router",
      cell: (router) => (
        <div>
          <p className="font-medium">{router.name}</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {router.username}
          </p>
        </div>
      ),
    },
    {
      key: "branchId",
      header: "Lokasi",
      cell: (router) => (
        <span className="text-muted-foreground">
          {branches.find((branch) => branch.id === router.branchId)?.name ??
            "-"}
        </span>
      ),
    },
    {
      key: "host",
      header: "IP address",
      cell: (router) => (
        <span className="font-mono text-xs">
          {router.host}:{router.apiPort}
        </span>
      ),
    },
    {
      key: "customerCount",
      header: "Pelanggan aktif",
      cell: (router) => (
        <div>
          <p className="font-medium">{router.customerCount}</p>
          <p className="text-xs text-muted-foreground">
            {router.serviceCount} service
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (router) => (
        <StatusBadge tone={statusTone[router.status]}>
          {router.status}
        </StatusBadge>
      ),
    },
    {
      key: "lastSeenAt",
      header: "Terakhir terlihat",
      cell: (router) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(router.lastSeenAt)}
        </span>
      ),
    },
    {
      key: "lastTestResult",
      header: "Test",
      cell: (router) =>
        router.lastTestResult ? (
          <StatusBadge
            tone={router.lastTestResult === "success" ? "success" : "danger"}
          >
            {router.lastTestResult}
          </StatusBadge>
        ) : (
          <span className="text-muted-foreground">Belum</span>
        ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (router) => (
        <div className="flex justify-end gap-1">
          <ActionIconButton
            icon={EyeIcon}
            label="Lihat detail router"
            onPress={() => onView(router)}
          />
          <ActionIconButton
            icon={PencilIcon}
            label="Edit router"
            onPress={() => onEdit(router)}
          />
          <ActionIconButton
            icon={ActivityIcon}
            label="Test koneksi router"
            onPress={() => onTest(router)}
          />
          <ActionIconButton
            icon={KeyRoundIcon}
            label="Rotasi password router"
            onPress={() => onRotate(router)}
          />
          <ActionIconButton
            icon={Trash2Icon}
            label={
              router.serviceCount > 0 || router.relatedDeviceCount > 0
                ? "Tidak bisa dihapus: masih ada service/device terhubung"
                : "Hapus router"
            }
            tone="destructive"
            isDisabled={
              router.serviceCount > 0 || router.relatedDeviceCount > 0
            }
            onPress={() => onDelete(router)}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={routers}
      columns={columns}
      getRowKey={(router) => router.id}
      ariaLabel="Daftar router"
      emptyMessage="Belum ada router."
    />
  );
}
