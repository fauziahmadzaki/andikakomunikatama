"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useBranchStore } from "@/features/branches/store/branch-store";
import type { Router } from "@/features/network/data/types";
import { useNetworkStore } from "@/features/network/store/network-store";
import { useSubscriptionStore } from "@/features/subscriptions/store/subscription-store";

export type RouterRow = Router & {
  customerCount: number;
  serviceCount: number;
  relatedDeviceCount: number;
};

export function useRoutersPage() {
  const router = useRouter();
  const routers = useNetworkStore((state) => state.routers);
  const fetchRouters = useNetworkStore((state) => state.fetchRouters);
  const antennas = useNetworkStore((state) => state.antennas);
  const tunnels = useNetworkStore((state) => state.tunnels);
  const testRouter = useNetworkStore((state) => state.testRouter);
  const removeRouter = useNetworkStore((state) => state.removeRouter);
  const rotateRouterSecret = useNetworkStore(
    (state) => state.rotateRouterSecret
  );

  useEffect(() => {
    fetchRouters();
  }, [fetchRouters]);
  const services = useSubscriptionStore((state) => state.services);
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const branches = useBranchStore((state) => state.branches);
  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRouter, setEditingRouter] = useState<Router | null>(null);
  const [confirmRouter, setConfirmRouter] = useState<RouterRow | null>(null);
  const [rotateRouter, setRotateRouter] = useState<RouterRow | null>(null);
  const [newSecret, setNewSecret] = useState("");

  const activeSubscriptionIds = useMemo(
    () =>
      new Set(
        subscriptions
          .filter((subscription) => subscription.status === "active")
          .map((subscription) => subscription.id)
      ),
    [subscriptions]
  );

  const rows = useMemo<RouterRow[]>(
    () =>
      routers.map((item) => {
        const routerServices = services.filter(
          (service) => service.routerId === item.id
        );
        const activeCustomerIds = new Set(
          routerServices
            .filter((service) =>
              activeSubscriptionIds.has(service.subscriptionId)
            )
            .map(
              (service) =>
                subscriptions.find(
                  (subscription) =>
                    subscription.id === service.subscriptionId
                )?.customerId
            )
            .filter((customerId): customerId is string =>
              Boolean(customerId)
            )
        );
        return {
          ...item,
          customerCount: activeCustomerIds.size,
          serviceCount: routerServices.length,
          relatedDeviceCount:
            antennas.filter((antenna) => antenna.routerId === item.id).length +
            tunnels.filter((tunnel) => tunnel.routerId === item.id).length,
        };
      }),
    [activeSubscriptionIds, antennas, routers, services, subscriptions, tunnels]
  );

  const connectedCustomers = useMemo(() => {
    const customerIds = new Set<string>();
    for (const service of services) {
      if (
        service.routerId &&
        activeSubscriptionIds.has(service.subscriptionId)
      ) {
        const subscription = subscriptions.find(
          (item) => item.id === service.subscriptionId
        );
        if (subscription) {
          customerIds.add(subscription.customerId);
        }
      }
    }
    return customerIds.size;
  }, [activeSubscriptionIds, services, subscriptions]);

  const filtered = useMemo(
    () =>
      rows.filter((item) => {
        const matchesQuery =
          !query ||
          `${item.name} ${item.host} ${item.username}`
            .toLowerCase()
            .includes(query.toLowerCase());
        const matchesBranch =
          branchFilter === "all" || item.branchId === branchFilter;
        const matchesStatus =
          statusFilter === "all" || item.status === statusFilter;
        return matchesQuery && matchesBranch && matchesStatus;
      }),
    [branchFilter, query, rows, statusFilter]
  );

  const stats = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((item) => item.status === "active").length,
      maintenance: rows.filter((item) => item.status === "maintenance").length,
      connectedCustomers,
    }),
    [connectedCustomers, rows]
  );

  function openCreate() {
    setEditingRouter(null);
    setDialogOpen(true);
  }

  function openEdit(item: Router) {
    setEditingRouter(item);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingRouter(null);
  }

  async function test(item: RouterRow) {
    toast.loading(`Mengecek koneksi ke ${item.host}:${item.apiPort}...`, {
      id: `test-${item.id}`,
    });
    const res = await testRouter(item.id);
    if (res.success) {
      toast.success(res.message, { id: `test-${item.id}` });
    } else {
      toast.error(res.message, { id: `test-${item.id}` });
    }
  }

  async function confirmDelete() {
    if (!confirmRouter) {
      return;
    }
    const result = await removeRouter(confirmRouter.id);
    if (!result.ok) {
      toast.error(result.message ?? "Router tidak bisa dihapus.");
    } else {
      toast.success("Router dihapus.");
    }
    setConfirmRouter(null);
  }

  async function confirmRotate() {
    if (!rotateRouter) {
      return;
    }
    if (newSecret.trim().length < 4) {
      toast.error("Password minimal 4 karakter.");
      return;
    }
    await rotateRouterSecret(rotateRouter.id, newSecret);
    toast.success("Password router berhasil dirotasi.");
    setRotateRouter(null);
    setNewSecret("");
  }

  return {
    routers: filtered,
    branches,
    query,
    setQuery,
    branchFilter,
    setBranchFilter,
    statusFilter,
    setStatusFilter,
    stats,
    dialogOpen,
    editingRouter,
    openCreate,
    openEdit,
    closeDialog,
    confirmRouter,
    setConfirmRouter,
    confirmDelete,
    rotateRouter,
    setRotateRouter,
    newSecret,
    setNewSecret,
    confirmRotate,
    test,
    viewRouter: (id: string) =>
      router.push(`/dashboard/jaringan/router/${id}`),
  };
}
