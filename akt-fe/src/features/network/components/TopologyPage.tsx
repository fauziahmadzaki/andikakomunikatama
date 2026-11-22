"use client";

import { MapPinIcon, SearchIcon } from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBranchStore } from "@/features/branches/store/branch-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { PassiveDevice } from "@/features/network/data/types";
import { useTopology } from "@/features/network/hooks/useTopology";

export function TopologyPage() {
  const { passiveDevices, form, setForm, result, search } = useTopology();
  const branches = useBranchStore((state) => state.branches);

  const columns: DataTableColumn<PassiveDevice>[] = [
    {
      key: "code",
      header: "ODP",
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
      key: "branchId",
      header: "Cabang",
      cell: (device) =>
        branches.find((branch) => branch.id === device.branchId)?.name ?? "-",
    },
    {
      key: "parentDeviceId",
      header: "Parent",
      cell: (device) =>
        passiveDevices.find((item) => item.id === device.parentDeviceId)
          ?.code ?? "-",
    },
    {
      key: "capacity",
      header: "Kapasitas",
      cell: (device) => `${device.usedCapacity}/${device.capacity} port`,
    },
    {
      key: "available",
      header: "Tersedia",
      cell: (device) => {
        const available = device.capacity - device.usedCapacity;
        return (
          <StatusBadge tone={available > 0 ? "success" : "danger"}>
            {available} port
          </StatusBadge>
        );
      },
    },
    {
      key: "coordinates",
      header: "Koordinat",
      cell: (device) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {device.latitude}, {device.longitude}
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Topologi & nearest ODP"
        description="Cari ODP terdekat berdasarkan koordinat pelanggan."
      />

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="gap-0 py-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle>Cari ODP terdekat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <Field>
              <FieldLabel htmlFor="topology-lat">Latitude</FieldLabel>
              <Input
                id="topology-lat"
                value={form.latitude}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    latitude: event.target.value,
                  }))
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="topology-lng">Longitude</FieldLabel>
              <Input
                id="topology-lng"
                value={form.longitude}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    longitude: event.target.value,
                  }))
                }
              />
            </Field>
            <Button className="w-full" onPress={search}>
              <SearchIcon />
              Cari ODP
            </Button>

            {result ? (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  <MapPinIcon className="size-4 text-primary" />
                  {result.device.name} ({result.device.code})
                </p>
                <p className="mt-1 text-muted-foreground">
                  {result.distance.toFixed(2)} km · {result.available} port
                  tersedia
                </p>
              </div>
            ) : result === undefined ? null : (
              <p className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                Tidak ada ODP dengan kapasitas tersedia.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle>ODP & kapasitas</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <DataTable
              data={passiveDevices.filter((device) => device.type === "odp")}
              columns={columns}
              getRowKey={(device) => device.id}
              ariaLabel="Daftar ODP"
              emptyMessage="Belum ada ODP."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
