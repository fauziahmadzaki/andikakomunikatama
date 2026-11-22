"use client";

import { useEffect, useState } from "react";
import { CheckCircle2Icon, RefreshCwIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { SelectField } from "@/components/shared/SelectField";
import type { Router } from "@/features/network/data/types";

export function SyncPppoeDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [routers, setRouters] = useState<Router[]>([]);
  const [selectedRouterId, setSelectedRouterId] = useState<string>("all");
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{
    totalScanned: number;
    added: number;
    skipped: number;
    failed: number;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setResult(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      fetch(`${apiUrl}/routers`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setRouters(json.data);
          }
        })
        .catch((err) => console.warn("Gagal load routers:", err));
    }
  }, [open]);

  const handleSync = async () => {
    setSyncing(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

    try {
      const res = await fetch(`${apiUrl}/monitoring/sync-pppoe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routerId: selectedRouterId === "all" ? undefined : selectedRouterId,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
        toast.success(
          `Sinkronisasi PPPoE selesai! ${json.data.added} target baru ditambahkan, ${json.data.skipped} dilewati (sudah ada).`
        );
        onSuccess();
      } else {
        toast.error(json.message || "Gagal melakukan sinkronisasi PPPoE.");
      }
    } catch {
      toast.error("Gagal terhubung ke backend server.");
    } finally {
      setSyncing(false);
    }
  };

  const routerOptions = [
    { value: "all", label: "Semua Router Aktif" },
    ...routers.map((r) => ({
      value: r.id,
      label: `${r.name} (${r.host})`,
    })),
  ];

  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <div className="space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <UsersIcon className="size-5 text-primary" />
            <DialogTitle>Sinkronkan PPPoE ke Monitoring</DialogTitle>
          </div>
          <DialogDescription>
            Memindai seluruh sesi PPPoE aktif di router MikroTik dan otomatis mendaftarkannya sebagai target monitoring Netwatch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field>
            <FieldLabel>Pilih Router Sumber</FieldLabel>
            <SelectField
              ariaLabel="Router sumber"
              value={selectedRouterId}
              onValueChange={setSelectedRouterId}
              options={routerOptions}
            />
          </Field>

          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">ℹ️ Mekanisme Otomatis:</p>
            <p>• Mengambil IP address dan username dari sesi PPPoE di router.</p>
            <p>• <strong>Otomatis Skip:</strong> Klien yang IP atau namanya sudah ada di monitoring SLA tidak akan diduplikasi.</p>
            <p>• Setiap klien baru otomatis dibuatkan rule Netwatch probe dengan interval 30 detik.</p>
          </div>

          {result && (
            <div className="rounded-xl border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                <CheckCircle2Icon className="size-4" />
                <span>Hasil Sinkronisasi</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-700 dark:text-emerald-400">
                  <div className="text-lg font-bold">{result.added}</div>
                  <div>Ditambahkan</div>
                </div>
                <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                  <div className="text-lg font-bold">{result.skipped}</div>
                  <div>Dilewati (Ada)</div>
                </div>
                <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                  <div className="text-lg font-bold">{result.totalScanned}</div>
                  <div>Total Dipindai</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onPress={onClose} isDisabled={syncing}>
            Tutup
          </Button>
          <Button onPress={handleSync} isDisabled={syncing} className="gap-2">
            <RefreshCwIcon className={`size-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Memindai Router..." : "Mulai Sinkronisasi"}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
