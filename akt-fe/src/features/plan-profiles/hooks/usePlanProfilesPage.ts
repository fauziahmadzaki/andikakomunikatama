"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { useNetworkStore } from "@/features/network/store/network-store";
import type { PlanProfile } from "@/features/plan-profiles/data/types";
import { usePlanProfileStore } from "@/features/plan-profiles/store/plan-profile-store";
import { hasPermission } from "@/features/users/data/permissions";
import { useUsersStore } from "@/features/users/store/users-store";

export function usePlanProfilesPage() {
  const router = useRouter();
  const profiles = usePlanProfileStore((state) => state.profiles);
  const ipPools = usePlanProfileStore((state) => state.ipPools);
  const isLoading = usePlanProfileStore((state) => state.isLoading);
  const fetchPlanProfiles = usePlanProfileStore(
    (state) => state.fetchPlanProfiles
  );
  const toggleProfile = usePlanProfileStore((state) => state.toggleProfile);
  const syncProfile = usePlanProfileStore((state) => state.syncProfile);
  const deleteProfile = usePlanProfileStore((state) => state.deleteProfile);
  const routers = useNetworkStore((state) => state.routers);
  const fetchRouters = useNetworkStore((state) => state.fetchRouters);
  const routerQueues = useNetworkStore((state) => state.routerQueues);
  const session = useAuthStore((state) => state.session);
  const rolePermissions = useUsersStore((state) => state.rolePermissions);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [routerFilter, setRouterFilter] = useState("all");
  const [confirmProfile, setConfirmProfile] = useState<PlanProfile | null>(null);

  const canCreate = session
    ? hasPermission(session.role, "plan.create", rolePermissions)
    : false;
  const canEdit = session
    ? hasPermission(session.role, "plan.update", rolePermissions)
    : false;
  const canViewDiscounts = session
    ? hasPermission(session.role, "discount.read", rolePermissions)
    : false;

  useEffect(() => {
    fetchPlanProfiles();
    fetchRouters();
  }, [fetchPlanProfiles, fetchRouters]);

  const filtered = useMemo(
    () =>
      profiles.filter((profile) => {
        const matchesQuery = `${profile.name} ${profile.description}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesType =
          typeFilter === "all" || profile.type === typeFilter;
        const matchesRouter =
          routerFilter === "all" || profile.routerId === routerFilter;
        return matchesQuery && matchesType && matchesRouter;
      }),
    [profiles, query, routerFilter, typeFilter]
  );

  const stats = {
    total: profiles.length,
    pppoe: profiles.filter((profile) => profile.type === "pppoe").length,
    hotspot: profiles.filter((profile) => profile.type === "hotspot").length,
    other: profiles.filter((profile) => profile.type === "other").length,
  };

  function routerName(routerId: string) {
    return routers.find((router) => router.id === routerId)?.name ?? "-";
  }

  function poolName(poolId: string) {
    return ipPools.find((pool) => pool.id === poolId)?.name ?? "-";
  }

  function queueName(profile: PlanProfile) {
    if (profile.parentQueueName) {
      return profile.parentQueueName;
    }

    return (
      routerQueues.find((queue) => queue.id === profile.parentQueueId)?.name ??
      "-"
    );
  }

  async function confirmDelete() {
    if (!confirmProfile) {
      return;
    }

    try {
      await deleteProfile(confirmProfile.id);
      toast.success("Paket dihapus.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus paket."
      );
    } finally {
      setConfirmProfile(null);
    }
  }

  async function toggle(profile: PlanProfile) {
    try {
      const result = await toggleProfile(profile.id);

      if (result.routerSync && !result.routerSync.success) {
        toast.warning(
          `Status paket diubah, tetapi sinkron ke router gagal: ${result.routerSync.message}`,
          { duration: 8000 }
        );
        return;
      }

      toast.success(
        profile.isActive ? "Paket dinonaktifkan." : "Paket diaktifkan."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal mengubah status paket."
      );
    }
  }

  async function sync(profile: PlanProfile) {
    try {
      const result = await syncProfile(profile.id);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.warning(result.message, { duration: 8000 });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal sinkron paket ke router."
      );
    }
  }

  function editProfile(profile: PlanProfile) {
    router.push(`/dashboard/paket/edit/${profile.id}`);
  }

  return {
    profiles: filtered,
    stats,
    query,
    setQuery,
    typeFilter,
    setTypeFilter,
    routerFilter,
    setRouterFilter,
    routers,
    confirmProfile,
    setConfirmProfile,
    routerName,
    poolName,
    queueName,
    toggle,
    sync,
    confirmDelete,
    canCreate,
    canEdit,
    canViewDiscounts,
    isLoading,
    editProfile,
  };
}
