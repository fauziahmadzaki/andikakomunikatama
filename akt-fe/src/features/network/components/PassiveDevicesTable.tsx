"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBranchStore } from "@/features/branches/store/branch-store";
import type { PassiveDevice } from "@/features/network/data/types";
import { useNetworkStore } from "@/features/network/store/network-store";

export function PassiveDevicesTable({
  devices,
  onEdit,
  onDelete,
}: {
  devices: PassiveDevice[];
  onEdit: (device: PassiveDevice) => void;
  onDelete: (device: PassiveDevice) => void;
}) {
  const branches = useBranchStore((state) => state.branches);
  const olts = useNetworkStore((state) => state.olts);
  const poles = useNetworkStore((state) => state.poles);

  const columns: DataTableColumn<PassiveDevice>[] = [
    {
      key: "code",
      header: "Perangkat",
      cell: (device) => (
        <div>
          <p className="font-medium">{device.name}</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {device.code}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Tipe",
      cell: (device) => (
        <StatusBadge tone="primary">{device.type.toUpperCase()}</StatusBadge>
      ),
    },
    {
      key: "branchId",
      header: "Cabang",
      cell: (device) => (
        <span className="text-muted-foreground">
          {branches.find((branch) => branch.id === device.branchId)?.name ??
            "-"}
        </span>
      ),
    },
    {
      key: "parentDeviceId",
      header: "Parent",
      cell: (device) => (
        <span className="font-mono text-[11px]">
          {devices.find((item) => item.id === device.parentDeviceId)?.code ??
            "-"}
        </span>
      ),
    },
    {
      key: "oltId",
      header: "OLT",
      cell: (device) =>
        olts.find((olt) => olt.id === device.oltId)?.name ?? "-",
    },
    {
      key: "poleId",
      header: "Tiang",
      cell: (device) =>
        poles.find((pole) => pole.id === device.poleId)?.code ?? "-",
    },
    {
      key: "capacity",
      header: "Kapasitas",
      cell: (device) => (
        <div className="space-y-1">
          <p className="text-xs">
            {device.usedCapacity}/{device.capacity} port
          </p>
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.min(
                  100,
                  (device.usedCapacity / device.capacity) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (device) => (
        <div className="flex justify-end gap-1">
          <ActionIconButton
            icon={PencilIcon}
            label="Edit perangkat pasif"
            onPress={() => onEdit(device)}
          />
          <ActionIconButton
            icon={Trash2Icon}
            label="Hapus perangkat pasif"
            tone="destructive"
            onPress={() => onDelete(device)}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={devices}
      columns={columns}
      getRowKey={(device) => device.id}
      ariaLabel="Daftar perangkat pasif"
      emptyMessage="Belum ada perangkat pasif."
    />
  );
}
