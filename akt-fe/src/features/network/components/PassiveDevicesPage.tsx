"use client";

import { ArrowLeftIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Antenna, Pole, Tunnel } from "@/features/network/data/types";
import { usePassiveDevicesPage } from "@/features/network/hooks/usePassiveDevicesPage";
import {
  AntennaDialog,
  PoleDialog,
  TunnelDialog,
} from "./PassiveChildDialogs";
import { PassiveDeviceDialog } from "./PassiveDeviceDialog";
import { PassiveDevicesTable } from "./PassiveDevicesTable";

export function PassiveDevicesPage() {
  const {
    passiveDevices,
    poles,
    antennas,
    tunnels,
    routers,
    olts,
    branches,
    open,
    setOpen,
    editingPassiveId,
    form,
    set,
    openCreatePassive,
    openEditPassive,
    savePassive,
    deletePassive,
    poleOpen,
    setPoleOpen,
    editingPoleId,
    poleForm,
    setPoleForm,
    openCreatePole,
    openEditPole,
    savePole,
    deletePole,
    antennaOpen,
    setAntennaOpen,
    editingAntennaId,
    antennaForm,
    setAntennaForm,
    openCreateAntenna,
    openEditAntenna,
    saveAntenna,
    deleteAntenna,
    tunnelOpen,
    setTunnelOpen,
    editingTunnelId,
    tunnelForm,
    setTunnelForm,
    openCreateTunnel,
    openEditTunnel,
    saveTunnel,
    deleteTunnel,
  } = usePassiveDevicesPage();

  const poleColumns: DataTableColumn<Pole>[] = [
    { key: "code", header: "Kode" },
    {
      key: "name",
      header: "Tiang",
      cell: (pole) => <span className="font-medium">{pole.name}</span>,
    },
    {
      key: "branchId",
      header: "Cabang",
      cell: (pole) =>
        branches.find((branch) => branch.id === pole.branchId)?.name ?? "-",
    },
    {
      key: "address",
      header: "Alamat",
      cell: (pole) => (
        <span className="text-muted-foreground">{pole.address}</span>
      ),
    },
    {
      key: "coordinates",
      header: "Koordinat",
      cell: (pole) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {pole.latitude}, {pole.longitude}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (pole) => (
        <div className="flex justify-end gap-1">
          <ActionIconButton
            icon={PencilIcon}
            label="Edit tiang"
            onPress={() => openEditPole(pole)}
          />
          <ActionIconButton
            icon={Trash2Icon}
            label="Hapus tiang"
            tone="destructive"
            onPress={() => deletePole(pole)}
          />
        </div>
      ),
    },
  ];

  const antennaColumns: DataTableColumn<Antenna>[] = [
    {
      key: "name",
      header: "Antena",
      cell: (antenna) => <span className="font-medium">{antenna.name}</span>,
    },
    {
      key: "routerId",
      header: "Router",
      cell: (antenna) =>
        routers.find((router) => router.id === antenna.routerId)?.name ?? "-",
    },
    {
      key: "branchId",
      header: "Cabang",
      cell: (antenna) =>
        branches.find((branch) => branch.id === antenna.branchId)?.name ?? "-",
    },
    { key: "mac", header: "MAC" },
    { key: "ip", header: "IP" },
    { key: "ssid", header: "SSID" },
    { key: "frequency", header: "Frekuensi" },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (antenna) => (
        <div className="flex justify-end gap-1">
          <ActionIconButton
            icon={PencilIcon}
            label="Edit antena"
            onPress={() => openEditAntenna(antenna)}
          />
          <ActionIconButton
            icon={Trash2Icon}
            label="Hapus antena"
            tone="destructive"
            onPress={() => deleteAntenna(antenna)}
          />
        </div>
      ),
    },
  ];

  const tunnelColumns: DataTableColumn<Tunnel>[] = [
    {
      key: "name",
      header: "Tunnel",
      cell: (tunnel) => <span className="font-medium">{tunnel.name}</span>,
    },
    {
      key: "routerId",
      header: "Router",
      cell: (tunnel) =>
        routers.find((router) => router.id === tunnel.routerId)?.name ?? "-",
    },
    { key: "username", header: "Username" },
    {
      key: "isActive",
      header: "Status",
      cell: (tunnel) => (tunnel.isActive ? "Aktif" : "Nonaktif"),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (tunnel) => (
        <div className="flex justify-end gap-1">
          <ActionIconButton
            icon={PencilIcon}
            label="Edit tunnel"
            onPress={() => openEditTunnel(tunnel)}
          />
          <ActionIconButton
            icon={Trash2Icon}
            label="Hapus tunnel"
            tone="destructive"
            onPress={() => deleteTunnel(tunnel)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="space-y-3">
        <LinkButton
          href="/dashboard/jaringan"
          variant="ghost"
          size="sm"
          className="-ml-2"
        >
          <ArrowLeftIcon />
          Kembali ke jaringan
        </LinkButton>
        <PageHeader
          title="Perangkat jaringan"
          description="Kelola perangkat pasif, tiang, antena, dan tunnel."
        >
          <Button onPress={openCreatePassive}>
            <PlusIcon />
            Tambah perangkat
          </Button>
        </PageHeader>
      </div>

      <Tabs defaultSelectedKey="passive" className="space-y-4">
        <TabsList variant="line" className="flex-wrap">
          <TabsTrigger id="passive">Perangkat pasif</TabsTrigger>
          <TabsTrigger id="poles">Tiang</TabsTrigger>
          <TabsTrigger id="antennas">Antena</TabsTrigger>
          <TabsTrigger id="tunnels">Tunnel</TabsTrigger>
        </TabsList>
        <TabsContent id="passive">
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <PassiveDevicesTable
                devices={passiveDevices}
                onEdit={openEditPassive}
                onDelete={deletePassive}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent id="poles">
          <Card className="gap-0 py-0">
            <CardContent className="space-y-3 p-4">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onPress={openCreatePole}>
                  <PlusIcon />
                  Tambah tiang
                </Button>
              </div>
              <DataTable
                data={poles}
                columns={poleColumns}
                getRowKey={(pole) => pole.id}
                ariaLabel="Daftar tiang"
                emptyMessage="Belum ada tiang."
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent id="antennas">
          <Card className="gap-0 py-0">
            <CardContent className="space-y-3 p-4">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onPress={openCreateAntenna}>
                  <PlusIcon />
                  Tambah antena
                </Button>
              </div>
              <DataTable
                data={antennas}
                columns={antennaColumns}
                getRowKey={(antenna) => antenna.id}
                ariaLabel="Daftar antena"
                emptyMessage="Belum ada antena."
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent id="tunnels">
          <Card className="gap-0 py-0">
            <CardContent className="space-y-3 p-4">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onPress={openCreateTunnel}>
                  <PlusIcon />
                  Tambah tunnel
                </Button>
              </div>
              <DataTable
                data={tunnels}
                columns={tunnelColumns}
                getRowKey={(tunnel) => tunnel.id}
                ariaLabel="Daftar tunnel"
                emptyMessage="Belum ada tunnel."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PassiveDeviceDialog
        open={open}
        form={form}
        set={set}
        branches={branches}
        devices={passiveDevices}
        olts={olts}
        poles={poles}
        isEditing={Boolean(editingPassiveId)}
        onSave={savePassive}
        onClose={() => setOpen(false)}
      />
      <PoleDialog
        open={poleOpen}
        form={poleForm}
        setForm={setPoleForm}
        branches={branches}
        isEditing={Boolean(editingPoleId)}
        onSave={savePole}
        onClose={() => setPoleOpen(false)}
      />
      <AntennaDialog
        open={antennaOpen}
        form={antennaForm}
        setForm={setAntennaForm}
        branches={branches}
        routers={routers}
        isEditing={Boolean(editingAntennaId)}
        onSave={saveAntenna}
        onClose={() => setAntennaOpen(false)}
      />
      <TunnelDialog
        open={tunnelOpen}
        form={tunnelForm}
        setForm={setTunnelForm}
        routers={routers}
        isEditing={Boolean(editingTunnelId)}
        onSave={saveTunnel}
        onClose={() => setTunnelOpen(false)}
      />
    </div>
  );
}
