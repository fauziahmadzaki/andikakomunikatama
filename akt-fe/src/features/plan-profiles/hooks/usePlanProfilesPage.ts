"use client";

import { useMemo, useState } from "react";
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
  const toggleProfile = usePlanProfileStore((state) => state.toggleProfile);
  const deleteProfile = usePlanProfileStore((state) => state.deleteProfile);
  const routers = useNetworkStore((state) => state.routers);
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

  function queueName(queueId: string) {
    return routerQueues.find((queue) => queue.id === queueId)?.name ?? "-";
  }

  function confirmDelete() {
    if (confirmProfile) {
      deleteProfile(confirmProfile.id);
      toast.success("Paket dihapus.");
    }
    setConfirmProfile(null);
  }

  function toggle(profile: PlanProfile) {
    toggleProfile(profile.id);
    toast.success(
      profile.isActive ? "Paket dinonaktifkan." : "Paket diaktifkan."
    );
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
    confirmDelete,
    canCreate,
    canEdit,
    canViewDiscounts,
    editProfile,
  };
}
