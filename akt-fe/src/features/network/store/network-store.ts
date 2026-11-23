import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useAuditStore } from "@/features/audit/store/audit-store";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription-store";
import type {
  AcsServer,
  Antenna,
  InventoryItem,
  InventoryMovement,
  MovementType,
  Olt,
  PassiveDevice,
  Pole,
  Router,
  RouterHotspotUser,
  RouterPppoeSecret,
  RouterQueue,
  Tunnel,
} from "../data/types";

type NetworkState = {
  routers: Router[];
  routerQueues: RouterQueue[];
  pppoeSecrets: RouterPppoeSecret[];
  hotspotUsers: RouterHotspotUser[];
  olts: Olt[];
  acsServers: AcsServer[];
  passiveDevices: PassiveDevice[];
  poles: Pole[];
  antennas: Antenna[];
  tunnels: Tunnel[];
  inventory: InventoryItem[];
  movements: InventoryMovement[];
  fetchRouters: () => Promise<void>;
  addRouter: (input: Omit<Router, "id"> & { password?: string }, actor?: string) => Promise<Router | null>;
  updateRouter: (id: string, patch: Partial<Router> & { password?: string }, actor?: string) => Promise<Router | null>;
  addRouterQueue: (
    input: Omit<RouterQueue, "id">,
    actor?: string
  ) => RouterQueue;
  removeRouter: (
    id: string,
    actor?: string
  ) => Promise<{ ok: boolean; message?: string }>;
  rotateRouterSecret: (
    id: string,
    password: string,
    actor?: string
  ) => Promise<void>;
  testRouter: (id: string, actor?: string) => Promise<{ success: boolean; message: string }>;
  testDirectRouter: (host: string, apiPort: number) => Promise<{ success: boolean; latencyMs?: number; message: string }>;
  addOlt: (input: Omit<Olt, "id">, actor?: string) => void;
  updateOlt: (id: string, patch: Partial<Olt>, actor?: string) => void;
  testOlt: (id: string, actor?: string) => void;
  syncAcs: (id: string, actor?: string) => void;
  addPassiveDevice: (input: Omit<PassiveDevice, "id">, actor?: string) => void;
  updatePassiveDevice: (
    id: string,
    patch: Partial<PassiveDevice>,
    actor?: string
  ) => void;
  occupyOdpPort: (odpId: string, port: number, actor?: string) => void;
  removePassiveDevice: (id: string, actor?: string) => void;
  addPole: (input: Omit<Pole, "id">, actor?: string) => void;
  updatePole: (id: string, patch: Partial<Pole>, actor?: string) => void;
  removePole: (id: string, actor?: string) => void;
  addAntenna: (input: Omit<Antenna, "id">, actor?: string) => void;
  updateAntenna: (
    id: string,
    patch: Partial<Antenna>,
    actor?: string
  ) => void;
  removeAntenna: (id: string, actor?: string) => void;
  addTunnel: (input: Omit<Tunnel, "id">, actor?: string) => void;
  updateTunnel: (id: string, patch: Partial<Tunnel>, actor?: string) => void;
  removeTunnel: (id: string, actor?: string) => void;
  addInventoryItem: (input: Omit<InventoryItem, "id">, actor?: string) => void;
  addMovement: (
    input: Omit<InventoryMovement, "id" | "occurredAt">,
    actor?: string
  ) => void;
  installItem: (itemId: string, reference: string, actor?: string) => void;
  returnItem: (itemId: string, reference: string, actor?: string) => void;
  resetNetwork: () => void;
};

import { generateUUID } from "@/lib/uuid";

function id() {
  return generateUUID();
}

function now() {
  return new Date().toISOString();
}

function audit(
  action: string,
  entityId: string,
  description: string,
  actor = "Administrator"
) {
  useAuditStore.getState().addAudit({
    action,
    entityType: "network",
    entityId,
    actor,
    branch: "JKT-01",
    description,
  });
}

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      routers: [],
      routerQueues: [],
      pppoeSecrets: [],
      hotspotUsers: [],
      olts: [],
      acsServers: [],
      passiveDevices: [],
      poles: [],
      antennas: [],
      tunnels: [],
      inventory: [],
      movements: [],

      fetchRouters: async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        try {
          const res = await fetch(`${apiUrl}/routers`);
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            set({ routers: json.data });
          }
        } catch (err) {
          console.warn("Gagal mengambil data router dari backend:", err);
        }
      },

      addRouter: async (input, actor = "NOC") => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        try {
          const res = await fetch(`${apiUrl}/routers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          });
          const json = await res.json();
          if (json.success && json.data) {
            const newRouter: Router = json.data;
            set((state) => ({ routers: [newRouter, ...state.routers] }));
            audit("router.created", newRouter.name, `Router ${newRouter.name} dibuat via API.`, actor);
            return newRouter;
          }
        } catch (err) {
          console.warn("Backend router create failed, fallback ke local state:", err);
        }

        const fallbackRouter: Router = {
          id: id(),
          name: input.name,
          branchId: input.branchId,
          host: input.host,
          apiPort: input.apiPort,
          username: input.username,
          secretConfigured: Boolean(input.password),
          secretRef: input.password ? `secret/router/${id()}` : undefined,
          status: input.status,
        };
        set((state) => ({ routers: [fallbackRouter, ...state.routers] }));
        audit("router.created", fallbackRouter.name, `Router ${fallbackRouter.name} dibuat (local).`, actor);
        return fallbackRouter;
      },

      updateRouter: async (routerId, patch, actor = "NOC") => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        try {
          const res = await fetch(`${apiUrl}/routers/${routerId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
          });
          const json = await res.json();
          if (json.success && json.data) {
            const updatedRouter: Router = json.data;
            set((state) => ({
              routers: state.routers.map((r) => (r.id === routerId ? updatedRouter : r)),
            }));
            audit("router.updated", updatedRouter.name, `Router ${updatedRouter.name} diperbarui via API.`, actor);
            return updatedRouter;
          }
        } catch (err) {
          console.warn("Backend router update failed, fallback ke local state:", err);
        }

        set((state) => ({
          routers: state.routers.map((router) =>
            router.id === routerId ? { ...router, ...patch } : router
          ),
        }));
        const router = get().routers.find((item) => item.id === routerId);
        audit("router.updated", router?.name ?? routerId, `Router ${router?.name ?? routerId} diperbarui (local).`, actor);
        return router ?? null;
      },

      addRouterQueue: (input, actor = "NOC") => {
        const queue: RouterQueue = { ...input, id: id() };
        set((state) => ({
          routerQueues: [queue, ...state.routerQueues],
        }));
        audit(
          "router.queue_created",
          queue.name,
          `Queue ${queue.name} ditambahkan ke router.`,
          actor
        );
        return queue;
      },

      removeRouter: async (routerId, actor = "NOC") => {
        const router = get().routers.find((item) => item.id === routerId);
        const hasServices = useSubscriptionStore
          .getState()
          .services.some((service) => service.routerId === routerId);
        const hasDevices =
          get().antennas.some((antenna) => antenna.routerId === routerId) ||
          get().tunnels.some((tunnel) => tunnel.routerId === routerId);
        if (hasServices || hasDevices) {
          return {
            ok: false,
            message:
              "Router masih digunakan oleh service, antena, atau tunnel.",
          };
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        try {
          await fetch(`${apiUrl}/routers/${routerId}`, { method: "DELETE" });
        } catch (err) {
          console.warn("Backend delete router failed:", err);
        }

        set((state) => ({
          routers: state.routers.filter((item) => item.id !== routerId),
        }));
        audit(
          "router.removed",
          router?.name ?? routerId,
          `Router ${router?.name ?? routerId} dihapus.`,
          actor
        );
        return { ok: true };
      },

      rotateRouterSecret: async (routerId, password, actor = "NOC") => {
        if (password.trim().length < 6) {
          return;
        }
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        try {
          await fetch(`${apiUrl}/routers/${routerId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          });
        } catch (err) {
          console.warn("Backend rotate secret failed:", err);
        }

        set((state) => ({
          routers: state.routers.map((router) =>
            router.id === routerId
              ? {
                  ...router,
                  secretConfigured: true,
                  secretRef: `secret/router/${routerId}`,
                }
              : router
          ),
        }));
        const router = get().routers.find((item) => item.id === routerId);
        audit(
          "router.secret_rotated",
          router?.name ?? routerId,
          `Secret router ${router?.name ?? routerId} dirotasi.`,
          actor
        );
      },

      testRouter: async (routerId, actor = "NOC") => {
        const router = get().routers.find((item) => item.id === routerId);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

        try {
          const res = await fetch(`${apiUrl}/routers/${routerId}/test`, {
            method: "POST",
          });
          const json = await res.json();
          if (json.success && json.data) {
            const { success, message, router: updated } = json.data;
            if (updated) {
              set((state) => ({
                routers: state.routers.map((item) => (item.id === routerId ? updated : item)),
              }));
            }
            audit(
              success ? "router.tested" : "router.test_failed",
              router?.name ?? routerId,
              message,
              actor
            );
            return { success, message };
          }
        } catch (err) {
          console.warn("Backend test router failed:", err);
        }

        const fallbackSuccess = router?.status !== "maintenance";
        const fallbackMsg = fallbackSuccess
          ? `Koneksi router ${router?.name ?? routerId} berhasil.`
          : `Koneksi router ${router?.name ?? routerId} gagal.`;

        set((state) => ({
          routers: state.routers.map((item) =>
            item.id === routerId
              ? {
                  ...item,
                  lastTestResult: fallbackSuccess ? "success" : "failed",
                  lastSeenAt: fallbackSuccess ? now() : item.lastSeenAt,
                  status: fallbackSuccess ? "active" : item.status,
                }
              : item
          ),
        }));
        audit(
          fallbackSuccess ? "router.tested" : "router.test_failed",
          router?.name ?? routerId,
          fallbackMsg,
          actor
        );
        return { success: fallbackSuccess, message: fallbackMsg };
      },

      testDirectRouter: async (host: string, apiPort: number) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        try {
          const res = await fetch(`${apiUrl}/routers/test-connection`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ host, apiPort }),
          });
          const json = await res.json();
          if (json.data) {
            return json.data;
          }
          return {
            success: json.success ?? false,
            message: json.message || "Test koneksi selesai.",
          };
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Gagal terhubung ke backend.";
          return { success: false, message: `Error test koneksi: ${msg}` };
        }
      },

      addOlt: (input, actor = "NOC") => {
        const olt: Olt = { ...input, id: id() };
        set((state) => ({ olts: [olt, ...state.olts] }));
        audit("olt.created", olt.name, `OLT ${olt.name} dibuat.`, actor);
      },

      updateOlt: (oltId, patch, actor = "NOC") => {
        set((state) => ({
          olts: state.olts.map((olt) =>
            olt.id === oltId ? { ...olt, ...patch } : olt
          ),
        }));
        const olt = get().olts.find((item) => item.id === oltId);
        audit(
          "olt.updated",
          olt?.name ?? oltId,
          `OLT ${olt?.name ?? oltId} diperbarui.`,
          actor
        );
      },

      testOlt: (oltId, actor = "NOC") => {
        const olt = get().olts.find((item) => item.id === oltId);
        if (!olt) {
          return;
        }
        const success = olt.status === "active";
        set((state) => ({
          olts: state.olts.map((item) =>
            item.id === oltId
              ? {
                  ...item,
                  lastTestResult: success ? "success" : "failed",
                }
              : item
          ),
        }));
        audit(
          success ? "olt.tested" : "olt.test_failed",
          olt.name,
          success
            ? `Koneksi OLT ${olt.name} berhasil.`
            : `Koneksi OLT ${olt.name} gagal.`,
          actor
        );
      },

      syncAcs: (acsId, actor = "NOC") => {
        set((state) => ({
          acsServers: state.acsServers.map((acs) =>
            acs.id === acsId
              ? {
                  ...acs,
                  lastSyncAt: now(),
                  status: "healthy",
                }
              : acs
          ),
        }));
        const acs = get().acsServers.find((item) => item.id === acsId);
        audit("acs.synced", acs?.name ?? acsId, `ACS ${acs?.name ?? acsId} disinkronkan.`, actor);
      },

      addPassiveDevice: (input, actor = "NOC") => {
        const device: PassiveDevice = { ...input, id: id() };
        set((state) => ({
          passiveDevices: [device, ...state.passiveDevices],
        }));
        audit(
          "passive_device.created",
          device.code,
          `Perangkat pasif ${device.code} dibuat.`,
          actor
        );
      },

      updatePassiveDevice: (deviceId, patch, actor = "NOC") => {
        set((state) => ({
          passiveDevices: state.passiveDevices.map((device) =>
            device.id === deviceId ? { ...device, ...patch } : device
          ),
        }));
        const device = get().passiveDevices.find((item) => item.id === deviceId);
        audit(
          "passive_device.updated",
          device?.code ?? deviceId,
          `Perangkat pasif ${device?.code ?? deviceId} diperbarui.`,
          actor
        );
      },

      removePassiveDevice: (deviceId, actor = "NOC") => {
        set((state) => ({
          passiveDevices: state.passiveDevices.filter(
            (device) => device.id !== deviceId
          ),
        }));
        audit("passive_device.removed", deviceId, "Perangkat pasif dihapus.", actor);
      },

      occupyOdpPort: (odpId, port, actor = "NOC") => {
        const device = get().passiveDevices.find((item) => item.id === odpId);
        if (!device || device.type !== "odp") {
          return;
        }
        const usedPorts =
          device.usedPorts ?? [];
        if (usedPorts.includes(port)) {
          return;
        }
        const nextUsedPorts = [...usedPorts, port].sort((a, b) => a - b);
        set((state) => ({
          passiveDevices: state.passiveDevices.map((item) =>
            item.id === odpId
              ? {
                  ...item,
                  usedPorts: nextUsedPorts,
                  usedCapacity: nextUsedPorts.length,
                }
              : item
          ),
        }));
        audit(
          "passive_device.port_used",
          device.code,
          `Port ${port} ODP ${device.code} dipakai.`,
          actor
        );
      },

      addPole: (input, actor = "NOC") => {
        const pole: Pole = { ...input, id: id() };
        set((state) => ({ poles: [pole, ...state.poles] }));
        audit("pole.created", pole.code, `Tiang ${pole.code} dibuat.`, actor);
      },

      updatePole: (poleId, patch, actor = "NOC") => {
        set((state) => ({
          poles: state.poles.map((pole) =>
            pole.id === poleId ? { ...pole, ...patch } : pole
          ),
        }));
        const pole = get().poles.find((item) => item.id === poleId);
        audit(
          "pole.updated",
          pole?.code ?? poleId,
          `Tiang ${pole?.code ?? poleId} diperbarui.`,
          actor
        );
      },

      removePole: (poleId, actor = "NOC") => {
        set((state) => ({
          poles: state.poles.filter((pole) => pole.id !== poleId),
        }));
        audit("pole.removed", poleId, "Tiang dihapus.", actor);
      },

      addAntenna: (input, actor = "NOC") => {
        const antenna: Antenna = { ...input, id: id() };
        set((state) => ({ antennas: [antenna, ...state.antennas] }));
        audit(
          "antenna.created",
          antenna.name,
          `Antena ${antenna.name} dibuat.`,
          actor
        );
      },

      updateAntenna: (antennaId, patch, actor = "NOC") => {
        set((state) => ({
          antennas: state.antennas.map((antenna) =>
            antenna.id === antennaId ? { ...antenna, ...patch } : antenna
          ),
        }));
        const antenna = get().antennas.find((item) => item.id === antennaId);
        audit(
          "antenna.updated",
          antenna?.name ?? antennaId,
          `Antena ${antenna?.name ?? antennaId} diperbarui.`,
          actor
        );
      },

      removeAntenna: (antennaId, actor = "NOC") => {
        set((state) => ({
          antennas: state.antennas.filter((antenna) => antenna.id !== antennaId),
        }));
        audit("antenna.removed", antennaId, "Antena dihapus.", actor);
      },

      addTunnel: (input, actor = "NOC") => {
        const tunnel: Tunnel = { ...input, id: id() };
        set((state) => ({ tunnels: [tunnel, ...state.tunnels] }));
        audit(
          "tunnel.created",
          tunnel.name,
          `Tunnel ${tunnel.name} dibuat.`,
          actor
        );
      },

      updateTunnel: (tunnelId, patch, actor = "NOC") => {
        set((state) => ({
          tunnels: state.tunnels.map((tunnel) =>
            tunnel.id === tunnelId ? { ...tunnel, ...patch } : tunnel
          ),
        }));
        const tunnel = get().tunnels.find((item) => item.id === tunnelId);
        audit(
          "tunnel.updated",
          tunnel?.name ?? tunnelId,
          `Tunnel ${tunnel?.name ?? tunnelId} diperbarui.`,
          actor
        );
      },

      removeTunnel: (tunnelId, actor = "NOC") => {
        set((state) => ({
          tunnels: state.tunnels.filter((tunnel) => tunnel.id !== tunnelId),
        }));
        audit("tunnel.removed", tunnelId, "Tunnel dihapus.", actor);
      },

      addInventoryItem: (input, actor = "Admin Gudang") => {
        const item: InventoryItem = { ...input, id: id() };
        set((state) => ({ inventory: [item, ...state.inventory] }));
        audit(
          "inventory.item_created",
          item.serialNumber,
          `Inventaris ${item.name} ditambahkan.`,
          actor
        );
      },

      addMovement: (input, actor = "Admin Gudang") => {
        const item = get().inventory.find(
          (inventoryItem) => inventoryItem.id === input.inventoryItemId
        );
        if (!item) {
          return;
        }
        const movement: InventoryMovement = {
          ...input,
          id: id(),
          actor,
          occurredAt: now(),
        };
        const statusMap: Record<MovementType, InventoryItem["status"]> = {
          in: "in_stock",
          out: "in_stock",
          transfer: item.status,
          adjustment: item.status,
          installed: "installed",
          returned: "returned",
        };
        set((state) => ({
          movements: [movement, ...state.movements],
          inventory: state.inventory.map((inventoryItem) =>
            inventoryItem.id === item.id
              ? {
                  ...inventoryItem,
                  status: statusMap[input.type],
                  branchId:
                    input.toBranchId ?? input.fromBranchId ?? inventoryItem.branchId,
                }
              : inventoryItem
          ),
        }));
        audit(
          "inventory.moved",
          item.serialNumber,
          `${item.name} dipindahkan (${input.type}).`,
          actor
        );
      },

      installItem: (itemId, reference, actor = "Teknisi NOC") => {
        const item = get().inventory.find((entry) => entry.id === itemId);
        if (!item) {
          return;
        }
        get().addMovement(
          {
            inventoryItemId: itemId,
            type: "installed",
            reference,
            fromBranchId: item.branchId,
            notes: "Instalasi perangkat.",
          },
          actor
        );
      },

      returnItem: (itemId, reference, actor = "Teknisi NOC") => {
        const item = get().inventory.find((entry) => entry.id === itemId);
        if (!item) {
          return;
        }
        get().addMovement(
          {
            inventoryItemId: itemId,
            type: "returned",
            reference,
            toBranchId: item.branchId,
            notes: "Pengembalian perangkat.",
          },
          actor
        );
      },

      resetNetwork: () => {
        set({
          routers: [],
          routerQueues: [],
          pppoeSecrets: [],
          hotspotUsers: [],
          olts: [],
          acsServers: [],
          passiveDevices: [],
          poles: [],
          antennas: [],
          tunnels: [],
          inventory: [],
          movements: [],
        });
      },
    }),
    {
      name: "muranet-network-v3",
      skipHydration: true,
    }
  )
);
