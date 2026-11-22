"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useBranchStore } from "@/features/branches/store/branch-store";
import type {
  Antenna,
  PassiveDevice,
  PassiveDeviceType,
  Pole,
  Tunnel,
} from "@/features/network/data/types";
import { useNetworkStore } from "@/features/network/store/network-store";

type PassiveForm = {
  code: string;
  name: string;
  type: PassiveDeviceType;
  branchId: string;
  parentDeviceId: string;
  oltId: string;
  poleId: string;
  capacity: string;
  usedCapacity: string;
  latitude: string;
  longitude: string;
};

type PoleForm = {
  code: string;
  name: string;
  branchId: string;
  latitude: string;
  longitude: string;
  address: string;
};

type AntennaForm = {
  name: string;
  branchId: string;
  routerId: string;
  mac: string;
  ip: string;
  ssid: string;
  frequency: string;
  channel: string;
};

type TunnelForm = {
  name: string;
  routerId: string;
  username: string;
  isActive: boolean;
};

const emptyPassive = (branchId: string): PassiveForm => ({
  code: "",
  name: "",
  type: "odp",
  branchId,
  parentDeviceId: "",
  oltId: "",
  poleId: "",
  capacity: "8",
  usedCapacity: "0",
  latitude: "-6.2",
  longitude: "106.8",
});

const emptyPole = (branchId: string): PoleForm => ({
  code: "",
  name: "",
  branchId,
  latitude: "-6.2",
  longitude: "106.8",
  address: "",
});

const emptyAntenna = (branchId: string, routerId: string): AntennaForm => ({
  name: "",
  branchId,
  routerId,
  mac: "",
  ip: "",
  ssid: "",
  frequency: "5 GHz",
  channel: "",
});

const emptyTunnel = (routerId: string): TunnelForm => ({
  name: "",
  routerId,
  username: "",
  isActive: true,
});

export function usePassiveDevicesPage() {
  const passiveDevices = useNetworkStore((state) => state.passiveDevices);
  const poles = useNetworkStore((state) => state.poles);
  const antennas = useNetworkStore((state) => state.antennas);
  const tunnels = useNetworkStore((state) => state.tunnels);
  const routers = useNetworkStore((state) => state.routers);
  const olts = useNetworkStore((state) => state.olts);
  const addPassiveDevice = useNetworkStore((state) => state.addPassiveDevice);
  const updatePassiveDevice = useNetworkStore(
    (state) => state.updatePassiveDevice
  );
  const removePassiveDevice = useNetworkStore(
    (state) => state.removePassiveDevice
  );
  const addPole = useNetworkStore((state) => state.addPole);
  const updatePole = useNetworkStore((state) => state.updatePole);
  const removePole = useNetworkStore((state) => state.removePole);
  const addAntenna = useNetworkStore((state) => state.addAntenna);
  const updateAntenna = useNetworkStore((state) => state.updateAntenna);
  const removeAntenna = useNetworkStore((state) => state.removeAntenna);
  const addTunnel = useNetworkStore((state) => state.addTunnel);
  const updateTunnel = useNetworkStore((state) => state.updateTunnel);
  const removeTunnel = useNetworkStore((state) => state.removeTunnel);
  const branches = useBranchStore((state) => state.branches);
  const defaultBranchId = branches[0]?.id ?? "br-jkt";

  const [open, setOpen] = useState(false);
  const [editingPassiveId, setEditingPassiveId] = useState<string | null>(null);
  const [form, setForm] = useState<PassiveForm>(() =>
    emptyPassive(defaultBranchId)
  );
  const [poleOpen, setPoleOpen] = useState(false);
  const [editingPoleId, setEditingPoleId] = useState<string | null>(null);
  const [poleForm, setPoleForm] = useState<PoleForm>(() =>
    emptyPole(defaultBranchId)
  );
  const [antennaOpen, setAntennaOpen] = useState(false);
  const [editingAntennaId, setEditingAntennaId] = useState<string | null>(null);
  const [antennaForm, setAntennaForm] = useState<AntennaForm>(() =>
    emptyAntenna(defaultBranchId, routers[0]?.id ?? "")
  );
  const [tunnelOpen, setTunnelOpen] = useState(false);
  const [editingTunnelId, setEditingTunnelId] = useState<string | null>(null);
  const [tunnelForm, setTunnelForm] = useState<TunnelForm>(() =>
    emptyTunnel(routers[0]?.id ?? "")
  );

  function set(key: keyof PassiveForm, value: string) {
    setForm((current) => {
      const next = { ...current } as unknown as Record<string, string>;
      next[key] = value;
      return next as unknown as PassiveForm;
    });
  }

  function openCreatePassive() {
    setEditingPassiveId(null);
    setForm(emptyPassive(defaultBranchId));
    setOpen(true);
  }

  function openEditPassive(device: PassiveDevice) {
    setEditingPassiveId(device.id);
    setForm({
      code: device.code,
      name: device.name,
      type: device.type,
      branchId: device.branchId,
      parentDeviceId: device.parentDeviceId ?? "",
      oltId: device.oltId ?? "",
      poleId: device.poleId ?? "",
      capacity: String(device.capacity),
      usedCapacity: String(device.usedCapacity),
      latitude: String(device.latitude),
      longitude: String(device.longitude),
    });
    setOpen(true);
  }

  function savePassive() {
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("Kode dan nama perangkat wajib diisi.");
      return;
    }
    const capacity = Number(form.capacity);
    const usedCapacity = Number(form.usedCapacity);
    if (usedCapacity > capacity) {
      toast.error("Kapasitas terpakai tidak boleh melebihi kapasitas.");
      return;
    }
    const payload = {
      code: form.code.toUpperCase(),
      name: form.name,
      type: form.type,
      branchId: form.branchId,
      parentDeviceId: form.parentDeviceId || undefined,
      oltId: form.oltId || undefined,
      poleId: form.poleId || undefined,
      capacity,
      usedCapacity,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
    };
    if (editingPassiveId) {
      updatePassiveDevice(editingPassiveId, payload);
      toast.success("Perangkat pasif diperbarui.");
    } else {
      addPassiveDevice(payload);
      toast.success("Perangkat pasif ditambahkan.");
    }
    setOpen(false);
  }

  function deletePassive(device: PassiveDevice) {
    removePassiveDevice(device.id);
    toast.success("Perangkat pasif dihapus.");
  }

  function openCreatePole() {
    setEditingPoleId(null);
    setPoleForm(emptyPole(defaultBranchId));
    setPoleOpen(true);
  }

  function openEditPole(pole: Pole) {
    setEditingPoleId(pole.id);
    setPoleForm({
      code: pole.code,
      name: pole.name,
      branchId: pole.branchId,
      latitude: String(pole.latitude),
      longitude: String(pole.longitude),
      address: pole.address,
    });
    setPoleOpen(true);
  }

  function savePole() {
    if (!poleForm.code.trim() || !poleForm.name.trim()) {
      toast.error("Kode dan nama tiang wajib diisi.");
      return;
    }
    const payload = {
      code: poleForm.code.toUpperCase(),
      name: poleForm.name,
      branchId: poleForm.branchId,
      latitude: Number(poleForm.latitude),
      longitude: Number(poleForm.longitude),
      address: poleForm.address,
    };
    if (editingPoleId) {
      updatePole(editingPoleId, payload);
      toast.success("Tiang diperbarui.");
    } else {
      addPole(payload);
      toast.success("Tiang ditambahkan.");
    }
    setPoleOpen(false);
  }

  function deletePole(pole: Pole) {
    removePole(pole.id);
    toast.success("Tiang dihapus.");
  }

  function openCreateAntenna() {
    setEditingAntennaId(null);
    setAntennaForm(emptyAntenna(defaultBranchId, routers[0]?.id ?? ""));
    setAntennaOpen(true);
  }

  function openEditAntenna(antenna: Antenna) {
    setEditingAntennaId(antenna.id);
    setAntennaForm({
      name: antenna.name,
      branchId: antenna.branchId,
      routerId: antenna.routerId,
      mac: antenna.mac,
      ip: antenna.ip,
      ssid: antenna.ssid,
      frequency: antenna.frequency,
      channel: antenna.channel,
    });
    setAntennaOpen(true);
  }

  function saveAntenna() {
    if (!antennaForm.name.trim() || !antennaForm.routerId) {
      toast.error("Nama antena dan router wajib diisi.");
      return;
    }
    const payload = { ...antennaForm };
    if (editingAntennaId) {
      updateAntenna(editingAntennaId, payload);
      toast.success("Antena diperbarui.");
    } else {
      addAntenna(payload);
      toast.success("Antena ditambahkan.");
    }
    setAntennaOpen(false);
  }

  function deleteAntenna(antenna: Antenna) {
    removeAntenna(antenna.id);
    toast.success("Antena dihapus.");
  }

  function openCreateTunnel() {
    setEditingTunnelId(null);
    setTunnelForm(emptyTunnel(routers[0]?.id ?? ""));
    setTunnelOpen(true);
  }

  function openEditTunnel(tunnel: Tunnel) {
    setEditingTunnelId(tunnel.id);
    setTunnelForm({
      name: tunnel.name,
      routerId: tunnel.routerId,
      username: tunnel.username,
      isActive: tunnel.isActive,
    });
    setTunnelOpen(true);
  }

  function saveTunnel() {
    if (!tunnelForm.name.trim() || !tunnelForm.routerId) {
      toast.error("Nama tunnel dan router wajib diisi.");
      return;
    }
    const payload = { ...tunnelForm };
    if (editingTunnelId) {
      updateTunnel(editingTunnelId, payload);
      toast.success("Tunnel diperbarui.");
    } else {
      addTunnel(payload);
      toast.success("Tunnel ditambahkan.");
    }
    setTunnelOpen(false);
  }

  function deleteTunnel(tunnel: Tunnel) {
    removeTunnel(tunnel.id);
    toast.success("Tunnel dihapus.");
  }

  return {
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
  };
}
