"use client";

import { ActivityIcon, KeyRoundIcon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBranchStore } from "@/features/branches/store/branch-store";
import type { Olt, Router } from "@/features/network/data/types";
import { formatDateTime } from "@/lib/format";

export function RoutersTable({
  routers,
  onTest,
  onRotate,
}: {
  routers: Router[];
  onTest: (router: Router) => void;
  onRotate: (router: Router) => void;
}) {
  const branches = useBranchStore((state) => state.branches);
  const columns: DataTableColumn<Router>[] = [
    {
      key: "name",
      header: "Router",
      cell: (router) => (
        <div>
          <p className="font-medium">{router.name}</p>
          <p className="text-xs text-muted-foreground">{branches.find((branch) => branch.id === router.branchId)?.name ?? "-"}</p>
        </div>
      ),
    },
    {
      key: "host",
      header: "Host",
      cell: (router) => (
        <span className="font-mono text-xs">
          {router.host}:{router.apiPort}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (router) => (
        <StatusBadge
          tone={
            router.status === "active"
              ? "success"
              : router.status === "maintenance"
                ? "warning"
                : "neutral"
          }
        >
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
            icon={ActivityIcon}
            label="Test koneksi router"
            onPress={() => onTest(router)}
          />
          <ActionIconButton
            icon={KeyRoundIcon}
            label="Rotasi credential"
            onPress={() => onRotate(router)}
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

export function OltsTable({
  olts,
  onTest,
  onRotate,
}: {
  olts: Olt[];
  onTest: (olt: Olt) => void;
  onRotate: (olt: Olt) => void;
}) {
  const branches = useBranchStore((state) => state.branches);
  const columns: DataTableColumn<Olt>[] = [
    {
      key: "name",
      header: "OLT",
      cell: (olt) => (
        <div>
          <p className="font-medium">{olt.name}</p>
          <p className="text-xs text-muted-foreground">
            {olt.vendor} {olt.model} · {branches.find((branch) => branch.id === olt.branchId)?.name ?? "-"}
          </p>
        </div>
      ),
    },
    {
      key: "host",
      header: "Host",
      cell: (olt) => (
        <span className="font-mono text-xs">
          {olt.host} · Telnet {olt.telnetPort} · SNMP {olt.snmpPort}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (olt) => (
        <StatusBadge
          tone={
            olt.status === "active"
              ? "success"
              : olt.status === "maintenance"
                ? "warning"
                : "neutral"
          }
        >
          {olt.status}
        </StatusBadge>
      ),
    },
    {
      key: "lastTestResult",
      header: "Test",
      cell: (olt) =>
        olt.lastTestResult ? (
          <StatusBadge
            tone={olt.lastTestResult === "success" ? "success" : "danger"}
          >
            {olt.lastTestResult}
          </StatusBadge>
        ) : (
          <span className="text-muted-foreground">Belum</span>
        ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (olt) => (
        <div className="flex justify-end gap-1">
          <ActionIconButton
            icon={ActivityIcon}
            label="Test koneksi OLT"
            onPress={() => onTest(olt)}
          />
          <ActionIconButton
            icon={KeyRoundIcon}
            label="Rotasi credential OLT"
            onPress={() => onRotate(olt)}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={olts}
      columns={columns}
      getRowKey={(olt) => olt.id}
      ariaLabel="Daftar OLT"
      emptyMessage="Belum ada OLT."
    />
  );
}
