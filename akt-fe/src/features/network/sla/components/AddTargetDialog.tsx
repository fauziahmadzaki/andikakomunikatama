"use client";

import { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { SelectField } from "@/components/shared/SelectField";
import type { Router } from "@/features/network/data/types";
import type { TargetType } from "../types";

export function AddTargetDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [host, setHost] = useState("");
  const [routerId, setRouterId] = useState("");
  const [type, setType] = useState<TargetType>("gateway");
  const [intervalSeconds, setIntervalSeconds] = useState("10");
  const [timeoutMs, setTimeoutMs] = useState("1000");

  const [routers, setRouters] = useState<Router[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      fetch(`${apiUrl}/routers`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            // Put online/responsive routers first
            const sorted = [...json.data].sort((a, b) => {
              if (a.lastTestResult === "success" && b.lastTestResult !== "success") return -1;
              if (b.lastTestResult === "success" && a.lastTestResult !== "success") return 1;
              return 0;
            });
            setRouters(sorted);
            if (sorted.length > 0 && !routerId) {
              setRouterId(sorted[0].id);
            }
          }
        })
        .catch((err) => console.warn("Gagal load routers:", err));
    }
  }, [open, routerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !host.trim() || !routerId) {
      toast.error("Nama target, host/IP, dan router pemantau wajib diisi.");
      return;
    }

    setSubmitting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

    try {
      const res = await fetch(`${apiUrl}/monitoring/targets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          host: host.trim(),
          routerId,
          type,
          intervalSeconds: Number(intervalSeconds) || 10,
          timeoutMs: Number(timeoutMs) || 1000,
        }),
      });

      const json = await res.json();
      if (json.success) {
        if (json.data?.netwatchSync?.success) {
          toast.success(json.data.netwatchSync.message || "Rule Netwatch berhasil dibuat di MikroTik!");
        } else {
          toast.warning(json.data?.netwatchSync?.message || "Target tersimpan tapi gagal terhubung ke router.");
        }
        setName("");
        setHost("");
        onSuccess();
        onClose();
      } else {
        toast.error(json.message || "Gagal menambahkan target monitoring.");
      }
    } catch {
      toast.error("Gagal terhubung ke backend server.");
    } finally {
      setSubmitting(false);
    }
  };

  const typeOptions = [
    { value: "gateway", label: "Gateway Core / Router" },
    { value: "olt", label: "OLT (Optical Line Terminal)" },
    { value: "switch", label: "Switch Distribution" },
    { value: "server", label: "Server / DNS / NMS" },
    { value: "customer_pppoe", label: "Pelanggan PPPoE" },
    { value: "customer_antena", label: "Pelanggan Antena" },
    { value: "customer_dedicated", label: "Pelanggan Dedicated" },
    { value: "other", label: "Perangkat Lainnya" },
  ];

  const routerOptions = routers.map((r) => ({
    value: r.id,
    label: `${r.name} (${r.host}:${r.apiPort})`,
  }));

  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <PlusIcon className="size-5 text-primary" />
            <DialogTitle>Tambah Target Monitoring SLA</DialogTitle>
          </div>
          <DialogDescription>
            Menambahkan host/IP baru untuk dipantau ketersediaannya (Uptime/Downtime) via Netwatch MikroTik.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 py-1">
          <Field>
            <FieldLabel>Nama Target / Perangkat</FieldLabel>
            <Input
              placeholder="Contoh: Gateway Core JKT, Switch OLT-01"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>

          <Field>
            <FieldLabel>Host / IP Address</FieldLabel>
            <Input
              placeholder="Contoh: 192.168.1.1 atau 10.10.10.2"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              required
            />
          </Field>

          <Field>
            <FieldLabel>Router Pemantau (Netwatch Runner)</FieldLabel>
            <SelectField
              ariaLabel="Router pemantau"
              value={routerId}
              onValueChange={setRouterId}
              options={routerOptions}
              placeholder="Pilih router yang memantau"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>Tipe Perangkat</FieldLabel>
              <SelectField
                ariaLabel="Tipe perangkat"
                value={type}
                onValueChange={(val: string) => setType(val as TargetType)}
                options={typeOptions}
              />
            </Field>

            <Field>
              <FieldLabel>Interval Ping (Detik)</FieldLabel>
              <Input
                type="number"
                min="5"
                max="3600"
                value={intervalSeconds}
                onChange={(e) => setIntervalSeconds(e.target.value)}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel>Timeout ICMP (Milidetik)</FieldLabel>
            <Input
              type="number"
              min="100"
              max="10000"
              step="100"
              value={timeoutMs}
              onChange={(e) => setTimeoutMs(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Jika host tidak merespons dalam kurun waktu ini, Netwatch memicu event DOWN.
            </p>
          </Field>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onPress={onClose} isDisabled={submitting}>
            Batal
          </Button>
          <Button type="submit" isDisabled={submitting}>
            {submitting ? "Menyimpan..." : "Simpan & Sinkronkan Netwatch"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
