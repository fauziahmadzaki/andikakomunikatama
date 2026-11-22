"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useBranchStore } from "@/features/branches/store/branch-store";
import { useCustomerStore } from "@/features/customers/store/customer-store";
import {
  createRouterTelemetry,
  nextRouterTelemetry,
  type RouterTelemetry,
  type RouterTrafficPoint,
} from "@/features/network/data/router-telemetry";
import type { Router } from "@/features/network/data/types";
import { useNetworkStore } from "@/features/network/store/network-store";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription-store";
import type { ServiceStatus } from "@/features/subscriptions/data/types";

export type RouterServiceRow = {
  id: string;
  customerName: string;
  subscriptionNumber: string;
  odpCode: string;
  oltName: string;
  username: string;
  status: ServiceStatus;
};

export type RouterTrafficSummary = {
  peakRx: number;
  peakTx: number;
  averageRx: number;
  averageTx: number;
};

export function useRouterDashboard(id: string) {
  const routerFromStore = useNetworkStore((state) =>
    state.routers.find((item) => item.id === id)
  );
  const [fetchedRouter, setFetchedRouter] = useState<Router | null>(null);
  const router = routerFromStore ?? fetchedRouter;

  const olts = useNetworkStore((state) => state.olts);
  const passiveDevices = useNetworkStore((state) => state.passiveDevices);
  const testRouter = useNetworkStore((state) => state.testRouter);
  const rotateRouterSecret = useNetworkStore(
    (state) => state.rotateRouterSecret
  );
  const services = useSubscriptionStore((state) => state.services);
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const customers = useCustomerStore((state) => state.customers);
  const branches = useBranchStore((state) => state.branches);

  const [telemetry, setTelemetry] = useState<RouterTelemetry | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [rotateOpen, setRotateOpen] = useState(false);
  const [newSecret, setNewSecret] = useState("");

  // Ensure router is fetched if not present in Zustand
  useEffect(() => {
    if (!routerFromStore) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      fetch(`${apiUrl}/routers/${id}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setFetchedRouter(json.data);
          }
        })
        .catch((err) => console.warn("Gagal load router by id:", err));
    }
  }, [id, routerFromStore]);

  const fetchRealTelemetry = async (silent = true) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    if (!silent) setIsRefreshing(true);

    try {
      const res = await fetch(`${apiUrl}/routers/${id}/telemetry`);
      const json = await res.json();

      if (json.success && json.data) {
        const real = json.data;
        const now = new Date();
        const point: RouterTrafficPoint = {
          time: now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          rxBps: real.rxBps,
          txBps: real.txBps,
        };

        setTelemetry((current) => {
          const prevHistory = current?.history ?? [];
          const nextHistory = [...prevHistory.slice(-23), point];
          return {
            routerId: id,
            connected: real.connected,
            status: real.status,
            message: real.message,
            model: real.model,
            routerOsVersion: real.routerOsVersion,
            architecture: real.architecture,
            serialNumber: real.serialNumber,
            uptimeSeconds: real.uptimeSeconds,
            cpuLoad: real.cpuLoad,
            memoryUsedMb: real.memoryUsedMb,
            memoryTotalMb: real.memoryTotalMb,
            diskUsedPercent: real.diskUsedPercent,
            temperatureC: real.temperatureC,
            rxBps: real.rxBps,
            txBps: real.txBps,
            activeSessions: real.activeSessions,
            latencyMs: real.latencyMs,
            packetLossPercent: real.connected ? 0 : 100,
            interfaces: real.interfaces || [],
            activeClients: real.activeClients || [],
            history: nextHistory,
            updatedAt: real.updatedAt,
          };
        });

        if (!silent) {
          if (real.connected) {
            toast.success(real.message || "Telemetri berhasil diperbarui.");
          } else {
            toast.error(real.message || "Router tidak dapat dihubungi.");
          }
        }
        return;
      }
    } catch (err) {
      console.warn("Gagal mengambil telemetri realtime dari router:", err);
      if (!silent) toast.error("Gagal terhubung ke backend.");
    } finally {
      if (!silent) setIsRefreshing(false);
    }

    if (router) {
      setTelemetry((current) =>
        current ? nextRouterTelemetry(current) : createRouterTelemetry(router)
      );
    }
  };

  useEffect(() => {
    fetchRealTelemetry(true);
  }, [id]);

  useEffect(() => {
    if (!isLive) {
      return;
    }
    const timer = window.setInterval(() => {
      fetchRealTelemetry(true);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [isLive, id]);

  const branchName =
    branches.find((branch) => branch.id === router?.branchId)?.name ?? "-";

  const serviceRows = useMemo<RouterServiceRow[]>(
    () =>
      services
        .filter((service) => service.routerId === id)
        .map((service) => {
          const subscription = subscriptions.find(
            (item) => item.id === service.subscriptionId
          );
          const customer = customers.find(
            (item) => item.id === subscription?.customerId
          );
          const odp = passiveDevices.find(
            (device) => device.id === service.passiveDeviceId
          );
          const olt = olts.find((item) => item.id === service.oltId);
          return {
            id: service.id,
            customerName: customer?.fullName ?? "Pelanggan",
            subscriptionNumber: subscription?.number ?? "-",
            odpCode: odp?.code ?? "-",
            oltName: olt?.name ?? "-",
            username: service.username || "-",
            status: service.status,
          };
        }),
    [customers, id, olts, passiveDevices, services, subscriptions]
  );

  const activeCustomerCount = useMemo(() => {
    const customerIds = new Set<string>();
    for (const service of services) {
      if (service.routerId === id) {
        const subscription = subscriptions.find(
          (item) =>
            item.id === service.subscriptionId && item.status === "active"
        );
        if (subscription) {
          customerIds.add(subscription.customerId);
        }
      }
    }
    return customerIds.size;
  }, [id, services, subscriptions]);

  const trafficSummary = useMemo<RouterTrafficSummary>(() => {
    const history = telemetry?.history ?? [];
    if (history.length === 0) {
      return { peakRx: 0, peakTx: 0, averageRx: 0, averageTx: 0 };
    }
    let sumRx = 0;
    let sumTx = 0;
    let peakRx = 0;
    let peakTx = 0;
    for (const point of history) {
      sumRx += point.rxBps;
      sumTx += point.txBps;
      if (point.rxBps > peakRx) peakRx = point.rxBps;
      if (point.txBps > peakTx) peakTx = point.txBps;
    }
    return {
      peakRx,
      peakTx,
      averageRx: Math.round(sumRx / history.length),
      averageTx: Math.round(sumTx / history.length),
    };
  }, [telemetry?.history]);

  function toggleLive() {
    setIsLive((current) => !current);
  }

  async function test() {
    if (!router) {
      return;
    }
    toast.loading(`Mengecek koneksi ke ${router.host}:${router.apiPort}...`, {
      id: `test-${router.id}`,
    });
    const res = await testRouter(router.id);
    if (res.success) {
      toast.success(res.message, { id: `test-${router.id}` });
      fetchRealTelemetry(true);
    } else {
      toast.error(res.message, { id: `test-${router.id}` });
    }
  }

  async function confirmRotate() {
    if (!router) {
      return;
    }
    if (newSecret.trim().length < 4) {
      toast.error("Password minimal 4 karakter.");
      return;
    }
    await rotateRouterSecret(router.id, newSecret);
    toast.success("Password router berhasil dirotasi.");
    setRotateOpen(false);
    setNewSecret("");
  }

  return {
    router,
    branchName,
    serviceRows,
    activeCustomerCount,
    serviceCount: serviceRows.length,
    telemetry,
    trafficSummary,
    isLive,
    isRefreshing,
    toggleLive,
    refreshTelemetry: () => fetchRealTelemetry(false),
    editOpen,
    setEditOpen,
    test,
    rotateOpen,
    setRotateOpen,
    newSecret,
    setNewSecret,
    confirmRotate,
  };
}
