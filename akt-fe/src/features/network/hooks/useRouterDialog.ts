"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useBranchStore } from "@/features/branches/store/branch-store";
import type { DeviceStatus, Router } from "@/features/network/data/types";
import { useNetworkStore } from "@/features/network/store/network-store";

type RouterForm = {
  branchId: string;
  name: string;
  host: string;
  apiPort: string;
  username: string;
  password: string;
  status: DeviceStatus;
};

function initialForm(
  router: Router | null | undefined,
  defaultBranchId: string
): RouterForm {
  return {
    branchId: router?.branchId ?? defaultBranchId,
    name: router?.name ?? "",
    host: router?.host ?? "",
    apiPort: String(router?.apiPort ?? 8728),
    username: router?.username ?? "admin",
    password: "", // Password is always blank on client side
    status: router?.status ?? "active",
  };
}

export function useRouterDialog({
  router,
  onClose,
}: {
  router?: Router | null;
  onClose: () => void;
}) {
  const branches = useBranchStore((state) => state.branches);
  const addRouter = useNetworkStore((state) => state.addRouter);
  const updateRouter = useNetworkStore((state) => state.updateRouter);
  const testDirectRouter = useNetworkStore((state) => state.testDirectRouter);

  const [form, setForm] = useState<RouterForm>(() =>
    initialForm(router, branches[0]?.id ?? "br-jkt")
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  function set<K extends keyof RouterForm>(key: K, value: RouterForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function testConnection() {
    if (!form.host.trim()) {
      toast.error("Host/IP address router wajib diisi untuk test koneksi.");
      return;
    }
    const apiPort = Number(form.apiPort);
    if (!Number.isInteger(apiPort) || apiPort < 1 || apiPort > 65535) {
      toast.error("Port API harus 1–65535.");
      return;
    }

    setIsTesting(true);
    try {
      const res = await testDirectRouter(form.host.trim(), apiPort);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Gagal melakukan test koneksi ke router.");
    } finally {
      setIsTesting(false);
    }
  }

  async function save() {
    if (!form.name.trim() || !form.host.trim() || !form.username.trim()) {
      toast.error("Nama, IP address, dan user router wajib diisi.");
      return;
    }
    const apiPort = Number(form.apiPort);
    if (!Number.isInteger(apiPort) || apiPort < 1 || apiPort > 65535) {
      toast.error("Port API harus 1–65535.");
      return;
    }
    if (!router && !form.password.trim()) {
      toast.error("Password user wajib diisi untuk router baru.");
      return;
    }
    if (form.password && form.password.trim().length < 4) {
      toast.error("Password minimal 4 karakter.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        branchId: form.branchId,
        name: form.name.trim(),
        host: form.host.trim(),
        apiPort,
        username: form.username.trim(),
        password: form.password ? form.password.trim() : undefined,
        status: form.status,
      };

      if (router) {
        const updatedResult: any = await updateRouter(router.id, payload);
        if (updatedResult?.connectionTest) {
          if (updatedResult.connectionTest.success) {
            toast.success(
              `Router diperbarui & koneksi sukses (${updatedResult.connectionTest.latencyMs}ms)!`
            );
          } else {
            toast.warning(
              `Router diperbarui (koneksi: ${updatedResult.connectionTest.message})`
            );
          }
        } else {
          toast.success("Router diperbarui.");
        }
      } else {
        if (!payload.password) {
          toast.error("Password wajib diisi untuk router baru.");
          return;
        }
        const createdResult: any = await addRouter({
          ...payload,
          secretConfigured: true,
        });
        if (createdResult?.connectionTest) {
          if (createdResult.connectionTest.success) {
            toast.success(
              `Router ditambahkan & koneksi sukses (${createdResult.connectionTest.latencyMs}ms)!`
            );
          } else {
            toast.warning(
              `Router ditambahkan (koneksi belum terjangkau: ${createdResult.connectionTest.message})`
            );
          }
        } else {
          toast.success("Router berhasil ditambahkan.");
        }
      }
      onClose();
    } catch {
      toast.error("Gagal menyimpan router.");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    branches,
    form,
    set,
    save,
    testConnection,
    isTesting,
    isSaving,
    isEditing: Boolean(router),
  };
}
