"use client";

import {
  ActivityIcon,
  ArrowLeftIcon,
  KeyRoundIcon,
  NetworkIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  RefreshCwIcon,
  UsersIcon,
} from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DeviceStatus } from "@/features/network/data/types";
import type {
  RouterActiveClient,
  RouterInterfaceData,
} from "@/features/network/data/router-telemetry";
import type { RouterServiceRow } from "@/features/network/hooks/useRouterDashboard";
import { useRouterDashboard } from "@/features/network/hooks/useRouterDashboard";
import type { ServiceStatus } from "@/features/subscriptions/data/types";
import { formatBitRate, formatDateTime, formatUptime } from "@/lib/format";
import { RouterDialog } from "./DeviceDialogs";
import { RouterHealthCards } from "./RouterHealthCards";
import { RouterSecretDialog } from "./RouterSecretDialog";
import { RouterTrafficChart } from "./RouterTrafficChart";

const routerTone: Record<DeviceStatus, "success" | "warning" | "neutral"> = {
  active: "success",
  inactive: "neutral",
  maintenance: "warning",
  retired: "neutral",
};

const serviceTone: Record<ServiceStatus, "success" | "warning" | "neutral"> = {
  active: "success",
  provisioned: "warning",
  pending: "warning",
  suspended: "warning",
  terminated: "neutral",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function RouterDashboardPage({ id }: { id: string }) {
  const {
    router,
    branchName,
    serviceRows,
    activeCustomerCount,
    serviceCount,
    telemetry,
    trafficSummary,
    isLive,
    isRefreshing,
    toggleLive,
    refreshTelemetry,
    editOpen,
    setEditOpen,
    test,
    rotateOpen,
    setRotateOpen,
    newSecret,
    setNewSecret,
    confirmRotate,
  } = useRouterDashboard(id);

  if (!router) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">Memuat data router...</p>
        <LinkButton href="/dashboard/jaringan/router">
          Kembali ke daftar router
        </LinkButton>
      </div>
    );
  }

  const columns: DataTableColumn<RouterServiceRow>[] = [
    {
      key: "customerName",
      header: "Pelanggan CRM",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.customerName}</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {row.subscriptionNumber}
          </p>
        </div>
      ),
    },
    {
      key: "username",
      header: "Username",
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.username}
        </span>
      ),
    },
    { key: "odpCode", header: "ODP" },
    { key: "oltName", header: "OLT" },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge tone={serviceTone[row.status]}>{row.status}</StatusBadge>
      ),
    },
  ];

  const clientColumns: DataTableColumn<RouterActiveClient>[] = [
    {
      key: "username",
      header: "Username",
      cell: (row) => <span className="font-mono font-medium">{row.username}</span>,
    },
    {
      key: "service",
      header: "Layanan",
      cell: (row) => (
        <StatusBadge tone={row.service === "pppoe" ? "primary" : "neutral"}>
          {row.service.toUpperCase()}
        </StatusBadge>
      ),
    },
    {
      key: "address",
      header: "IP Client",
      cell: (row) => <span className="font-mono text-xs">{row.address}</span>,
    },
    {
      key: "macAddress",
      header: "MAC / Caller ID",
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.macAddress}
        </span>
      ),
    },
    {
      key: "uptime",
      header: "Uptime Sesi",
      cell: (row) => <span className="text-xs">{row.uptime}</span>,
    },
  ];

  const interfaceColumns: DataTableColumn<RouterInterfaceData>[] = [
    {
      key: "name",
      header: "Interface",
      cell: (row) => <span className="font-mono font-medium">{row.name}</span>,
    },
    {
      key: "type",
      header: "Tipe",
      cell: (row) => <span className="text-xs text-muted-foreground">{row.type}</span>,
    },
    {
      key: "running",
      header: "Link Status",
      cell: (row) => (
        <StatusBadge tone={row.running ? "success" : "neutral"}>
          {row.running ? "Link Up" : "Down"}
        </StatusBadge>
      ),
    },
    {
      key: "rxBps",
      header: "Trafik RX (Download)",
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-emerald-600">
          {formatBitRate(row.rxBps)}
        </span>
      ),
    },
    {
      key: "txBps",
      header: "Trafik TX (Upload)",
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-blue-600">
          {formatBitRate(row.txBps)}
        </span>
      ),
    },
  ];

  const trafficStats = [
    { label: "RX saat ini", value: formatBitRate(telemetry?.rxBps ?? 0) },
    { label: "TX saat ini", value: formatBitRate(telemetry?.txBps ?? 0) },
    {
      label: "Rata-rata RX",
      value: formatBitRate(trafficSummary.averageRx),
    },
    {
      label: "Rata-rata TX",
      value: formatBitRate(trafficSummary.averageTx),
    },
    { label: "Peak RX", value: formatBitRate(trafficSummary.peakRx) },
    { label: "Peak TX", value: formatBitRate(trafficSummary.peakTx) },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="space-y-3">
        <LinkButton
          href="/dashboard/jaringan/router"
          variant="ghost"
          size="sm"
          className="-ml-2"
        >
          <ArrowLeftIcon />
          Kembali ke router
        </LinkButton>
        <PageHeader
          title={router.name}
          description={`${branchName} · ${router.host}:${router.apiPort}`}
        >
          <StatusBadge tone={routerTone[router.status]}>
            {router.status}
          </StatusBadge>
          <Button variant="outline" onPress={test}>
            <ActivityIcon />
            Test Port
          </Button>
          <Button variant="outline" onPress={() => setRotateOpen(true)}>
            <KeyRoundIcon />
            Rotasi password
          </Button>
          <Button variant="outline" onPress={() => setEditOpen(true)}>
            <PencilIcon />
            Edit
          </Button>
        </PageHeader>
      </div>

      {/* Connectivity Alert / Badge */}
      {telemetry?.connected === false ? (
        <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="font-semibold text-destructive">
              ⚠️ Router Tidak Dapat Dihubungi ({router.host}:{router.apiPort})
            </p>
            <p className="text-xs text-muted-foreground">
              {telemetry?.message || "Koneksi timeout/gagal."} Pastikan router MikroTik aktif dan service API berjalan: <code className="rounded bg-muted px-1.5 py-0.5">/ip service enable api</code>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onPress={refreshTelemetry}
              isDisabled={isRefreshing}
            >
              <RefreshCwIcon className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? "Mencoba..." : "Hubungkan Ulang"}
            </Button>
          </div>
        </div>
      ) : telemetry?.connected === true ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5 text-xs text-emerald-700 dark:text-emerald-400">
          <div className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
            <span>
              Sinkronisasi aktif: <strong>{telemetry.model}</strong> (RouterOS {telemetry.routerOsVersion}, {telemetry.architecture}) di {router.host}:{router.apiPort}
            </span>
          </div>
          <span>Latensi: {telemetry.latencyMs} ms · Uptime: {formatUptime(telemetry.uptimeSeconds)}</span>
        </div>
      ) : null}

      {/* Realtime Traffic Panel */}
      <Card className="gap-0 py-0">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <CardTitle>Traffic Realtime</CardTitle>
            <p className="text-xs text-muted-foreground">
              Sinkronisasi throughput per detik dari router.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={
                isLive
                  ? "flex items-center gap-2 text-xs font-medium text-emerald-600"
                  : "flex items-center gap-2 text-xs font-medium text-muted-foreground"
              }
            >
              <span
                className={
                  isLive
                    ? "size-2 animate-pulse rounded-full bg-emerald-500"
                    : "size-2 rounded-full bg-muted-foreground"
                }
              />
              {isLive ? "Live Sync (3s)" : "Terjeda"}
            </span>
            <Button variant="outline" size="sm" onPress={toggleLive}>
              {isLive ? <PauseIcon /> : <PlayIcon />}
              {isLive ? "Jeda" : "Lanjutkan"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onPress={refreshTelemetry}
              isDisabled={isRefreshing}
            >
              <RefreshCwIcon className={isRefreshing ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {trafficStats.map((item) => (
              <div key={item.label} className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-lg font-bold tracking-tight">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <RouterTrafficChart points={telemetry?.history ?? []} />

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Update terakhir:{" "}
              {telemetry ? formatDateTime(telemetry.updatedAt) : "-"}
            </span>
            <span>{telemetry?.history.length ?? 0} titik sampel</span>
          </div>
        </CardContent>
      </Card>

      {/* Hardware Health Metrics */}
      <RouterHealthCards telemetry={telemetry} />

      {/* Real Interfaces Panel */}
      <Card className="gap-0 py-0">
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <NetworkIcon className="size-4 text-primary" />
            <CardTitle>Interfaces Router</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">
            {telemetry?.interfaces?.length ?? 0} port fisik/virtual
          </span>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable
            data={telemetry?.interfaces ?? []}
            columns={interfaceColumns}
            getRowKey={(row) => row.name}
            ariaLabel="Interfaces router"
            emptyMessage="Belum ada data interface dari router."
          />
        </CardContent>
      </Card>

      {/* Real Active Clients (PPPoE / Hotspot) Panel */}
      <Card className="gap-0 py-0">
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <UsersIcon className="size-4 text-primary" />
            <CardTitle>Sesi Pelanggan Aktif (PPPoE & Hotspot)</CardTitle>
          </div>
          <span className="text-xs font-semibold text-emerald-600">
            {telemetry?.activeClients?.length ?? telemetry?.activeSessions ?? 0} sesi aktif
          </span>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable
            data={telemetry?.activeClients ?? []}
            columns={clientColumns}
            getRowKey={(row) => row.id}
            ariaLabel="Sesi aktif router"
            emptyMessage="Belum ada sesi pelanggan PPPoE atau Hotspot yang sedang aktif di router ini."
          />
        </CardContent>
      </Card>

      {/* CRM Services Mapping */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="gap-0 py-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle>Alokasi Pelanggan CRM</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5 text-sm">
            <InfoRow label="Pelanggan terdaftar" value={String(activeCustomerCount)} />
            <InfoRow label="Total layanan CRM" value={String(serviceCount)} />
            <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              Jumlah pelanggan CRM yang dialokasikan ke router ini pada sistem billing.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle>Status Autentikasi Router</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5 text-sm">
            <InfoRow
              label="Kredensial API"
              value={router.secretConfigured ? "Tersimpan" : "Belum diisi"}
            />
            <InfoRow
              label="Test Koneksi Terakhir"
              value={router.lastTestResult ?? "Belum"}
            />
            <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              Koneksi API diverifikasi otomatis saat simpan dan dapat diuji manual kapan saja.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Layanan CRM Terdaftar pada Router</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable
            data={serviceRows}
            columns={columns}
            getRowKey={(row) => row.id}
            ariaLabel="Service CRM router"
            emptyMessage="Belum ada service CRM yang terdaftar pada router ini."
          />
        </CardContent>
      </Card>

      {editOpen ? (
        <RouterDialog
          open={editOpen}
          router={router}
          onClose={() => setEditOpen(false)}
        />
      ) : null}

      <RouterSecretDialog
        open={rotateOpen}
        routerName={router.name}
        secret={newSecret}
        onSecretChange={setNewSecret}
        onSave={confirmRotate}
        onClose={() => {
          setRotateOpen(false);
          setNewSecret("");
        }}
      />
    </div>
  );
}
