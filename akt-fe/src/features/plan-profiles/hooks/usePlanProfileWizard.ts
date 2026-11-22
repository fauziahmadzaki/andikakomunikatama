"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Router } from "@/features/network/data/types";
import { useNetworkStore } from "@/features/network/store/network-store";
import {
  computeBandwidth,
  defaultOversubRatio,
} from "@/features/plan-profiles/data/bandwidth";
import {
  ipToNumber,
  isValidIpv4,
  suggestLocalAddress,
} from "@/features/plan-profiles/data/network";
import type {
  PlanProfile,
  PlanProfileBillingType,
  PlanProfileType,
  RouterIpPool,
} from "@/features/plan-profiles/data/types";
import { usePlanProfileStore } from "@/features/plan-profiles/store/plan-profile-store";

export type PlanProfileWizardForm = {
  name: string;
  description: string;
  price: string;
  type: PlanProfileType;
  billingType: PlanProfileBillingType;
  isActive: boolean;
  routerId: string;
  parentQueueId: string;
  poolMode: "existing" | "new";
  ipPoolId: string;
  newPoolName: string;
  newPoolStart: string;
  newPoolEnd: string;
  localAddress: string;
  downloadMbps: string;
  uploadMbps: string;
  oversubscription: boolean;
  oversubRatio: string;
};

export type SetPlanProfileField = <K extends keyof PlanProfileWizardForm>(
  key: K,
  value: PlanProfileWizardForm[K]
) => void;

function initialForm(
  routers: Router[],
  pools: RouterIpPool[],
  parentQueues: { id: string; routerId: string; name: string }[],
  profile?: PlanProfile
): PlanProfileWizardForm {
  if (profile) {
    return {
      name: profile.name,
      description: profile.description,
      price: String(profile.price),
      type: profile.type,
      billingType: profile.billingType,
      isActive: profile.isActive,
      routerId: profile.routerId,
      parentQueueId: profile.parentQueueId ?? "",
      poolMode: "existing",
      ipPoolId: profile.ipPoolId,
      newPoolName: "",
      newPoolStart: "",
      newPoolEnd: "",
      localAddress: profile.localAddress,
      downloadMbps: String(profile.downloadMbps),
      uploadMbps: String(profile.uploadMbps),
      oversubscription: profile.oversubscription,
      oversubRatio:
        profile.oversubRatio > 1
          ? String(profile.oversubRatio)
          : defaultOversubRatio,
    };
  }

  const router = routers[0];
  const pool = pools.find((item) => item.routerId === router?.id);
  const parentQueue = parentQueues.find(
    (queue) => queue.routerId === router?.id
  );

  return {
    name: "",
    description: "",
    price: "",
    type: "pppoe",
    billingType: "monthly",
    isActive: true,
    routerId: router?.id ?? "",
    parentQueueId: parentQueue?.id ?? "",
    poolMode: pool ? "existing" : "new",
    ipPoolId: pool?.id ?? "",
    newPoolName: "",
    newPoolStart: "",
    newPoolEnd: "",
    localAddress: pool ? suggestLocalAddress(pool.rangeStart) : "",
    downloadMbps: "10",
    uploadMbps: "10",
    oversubscription: true,
    oversubRatio: defaultOversubRatio,
  };
}

export function usePlanProfileWizard(profileId?: string) {
  const router = useRouter();
  const routers = useNetworkStore((state) => state.routers).filter(
    (item) => item.status === "active"
  );
  const routerQueues = useNetworkStore((state) => state.routerQueues);
  const profiles = usePlanProfileStore((state) => state.profiles);
  const ipPools = usePlanProfileStore((state) => state.ipPools);
  const addProfile = usePlanProfileStore((state) => state.addProfile);
  const updateProfile = usePlanProfileStore((state) => state.updateProfile);
  const profile = profileId
    ? profiles.find((item) => item.id === profileId)
    : undefined;
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [form, setForm] = useState<PlanProfileWizardForm>(() =>
    initialForm(routers, ipPools, routerQueues, profile)
  );

  const pools = ipPools.filter((pool) => pool.routerId === form.routerId);
  const parentQueues = routerQueues.filter(
    (queue) => queue.routerId === form.routerId && queue.kind === "parent"
  );
  const selectedRouter = routers.find((item) => item.id === form.routerId);
  const selectedPool = ipPools.find((pool) => pool.id === form.ipPoolId);
  const selectedParentQueue = routerQueues.find(
    (queue) => queue.id === form.parentQueueId
  );

  const preview = useMemo(
    () =>
      computeBandwidth({
        downloadMbps: Number(form.downloadMbps) || 0,
        uploadMbps: Number(form.uploadMbps) || 0,
        oversubscription: form.oversubscription,
        oversubRatio: Number(form.oversubRatio) || 1,
      }),
    [
      form.downloadMbps,
      form.uploadMbps,
      form.oversubscription,
      form.oversubRatio,
    ]
  );

  function set<K extends keyof PlanProfileWizardForm>(
    key: K,
    value: PlanProfileWizardForm[K]
  ) {
    setForm((current) => {
      const next: PlanProfileWizardForm = { ...current };
      next[key] = value;

      if (key === "routerId") {
        const routerPools = ipPools.filter(
          (pool) => pool.routerId === String(value)
        );
        const nextPool = routerPools[0];
        const nextParentQueue = routerQueues.find(
          (queue) =>
            queue.routerId === String(value) && queue.kind === "parent"
        );
        next.poolMode = nextPool ? "existing" : "new";
        next.ipPoolId = nextPool?.id ?? "";
        next.parentQueueId = nextParentQueue?.id ?? "";
        next.newPoolName = "";
        next.newPoolStart = "";
        next.newPoolEnd = "";
        next.localAddress = nextPool
          ? suggestLocalAddress(nextPool.rangeStart)
          : "";
      }

      if (key === "ipPoolId") {
        const pool = ipPools.find((item) => item.id === String(value));
        if (pool) {
          next.localAddress = suggestLocalAddress(pool.rangeStart);
        }
      }

      return next;
    });
    setError("");
  }

  function validate(currentStep: number) {
    if (currentStep === 1) {
      if (!form.name.trim()) {
        return "Nama profil wajib diisi.";
      }
      if (!form.price || Number(form.price) <= 0) {
        return "Harga profil wajib diisi.";
      }
    }

    if (currentStep === 2) {
      if (!form.routerId) {
        return "Pilih router target.";
      }
      if (!form.parentQueueId) {
        return "Pilih parent queue dari router.";
      }
      if (form.type !== "other" && !isValidIpv4(form.localAddress)) {
        return "Local address tidak valid.";
      }

      if (form.type !== "other" && form.poolMode === "existing") {
        if (!form.ipPoolId) {
          return "Pilih IP pool.";
        }
      } else if (form.type !== "other") {
        if (!form.newPoolName.trim()) {
          return "Nama IP pool wajib diisi.";
        }
        if (
          ipPools.some(
            (pool) =>
              pool.routerId === form.routerId &&
              pool.name.toLowerCase() === form.newPoolName.trim().toLowerCase()
          )
        ) {
          return "Nama IP pool sudah dipakai di router ini.";
        }
        if (!isValidIpv4(form.newPoolStart) || !isValidIpv4(form.newPoolEnd)) {
          return "Range IP pool tidak valid.";
        }
        if (ipToNumber(form.newPoolStart) > ipToNumber(form.newPoolEnd)) {
          return "IP awal pool harus lebih kecil dari IP akhir.";
        }
      }
    }

    if (currentStep === 3) {
      if (Number(form.downloadMbps) <= 0) {
        return "Bandwidth unduh wajib diisi.";
      }
      if (Number(form.uploadMbps) <= 0) {
        return "Bandwidth unggah wajib diisi.";
      }
    }

    return "";
  }

  function next() {
    const message = validate(step);
    if (message) {
      setError(message);
      toast.error(message);
      return;
    }

    setError("");
    setStep((current) => Math.min(4, current + 1));
  }

  function back() {
    setError("");
    setStep((current) => Math.max(1, current - 1));
  }

  function save() {
    for (const currentStep of [1, 2, 3]) {
      const message = validate(currentStep);
      if (message) {
        setError(message);
        setStep(currentStep);
        toast.error(message);
        return;
      }
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      type: form.type,
      billingType: form.billingType,
      isActive: form.isActive,
      routerId: form.routerId,
      parentQueueId: form.parentQueueId,
      ipPoolId:
        form.type !== "other" && form.poolMode === "existing"
          ? form.ipPoolId
          : undefined,
      newPool:
        form.type !== "other" && form.poolMode === "new"
          ? {
              routerId: form.routerId,
              name: form.newPoolName.trim(),
              rangeStart: form.newPoolStart.trim(),
              rangeEnd: form.newPoolEnd.trim(),
            }
          : undefined,
      localAddress: form.localAddress.trim(),
      downloadMbps: Number(form.downloadMbps),
      uploadMbps: Number(form.uploadMbps),
      oversubscription: form.oversubscription,
      oversubRatio: preview.ratio,
      cirDownloadMbps: preview.cirDownloadMbps,
      cirUploadMbps: preview.cirUploadMbps,
      mirDownloadMbps: preview.mirDownloadMbps,
      mirUploadMbps: preview.mirUploadMbps,
      burstDownloadMbps: preview.burstDownloadMbps,
      burstUploadMbps: preview.burstUploadMbps,
      rateLimit: preview.rateLimit,
    };

    if (profile) {
      updateProfile(profile.id, payload);
      toast.success("Paket diperbarui.");
    } else {
      addProfile(payload);
      toast.success("Paket dibuat.");
    }

    router.push("/dashboard/paket");
  }

  return {
    profile,
    isEditing: Boolean(profile),
    step,
    form,
    set,
    error,
    routers,
    pools,
    parentQueues,
    router: selectedRouter,
    selectedPool,
    selectedParentQueue,
    preview,
    next,
    back,
    save,
  };
}
