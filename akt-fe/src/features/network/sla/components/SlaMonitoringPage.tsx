"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { PlusIcon, RefreshCwIcon, SearchIcon, BellIcon, SendIcon } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/shared/SelectField";
import { Card, CardContent } from "@/components/ui/card";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { SlaTargetsTable } from "./SlaTargetsTable";
import { AddTargetDialog } from "./AddTargetDialog";
import { SyncPppoeDialog } from "./SyncPppoeDialog";
import { NetwatchScriptDialog } from "./NetwatchScriptDialog";
import { IncidentHistoryDialog } from "./IncidentHistoryDialog";
import { TelegramChannelsDialog } from "./TelegramChannelsDialog";
import { useSlaWebAlerts } from "../hooks/useSlaWebAlerts";
import type { MonitoringTarget, TargetSlaSummary } from "../types";

export function SlaMonitoringPage() {
  const [items, setItems] = useState<TargetSlaSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [routerFilter, setRouterFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [addOpen, setAddOpen] = useState(false);
  const [syncPppoeOpen, setSyncPppoeOpen] = useState(false);
  const [telegramOpen, setTelegramOpen] = useState(false);
  const [scriptTarget, setScriptTarget] = useState<MonitoringTarget | null>(null);
  const [incidentTarget, setIncidentTarget] = useState<MonitoringTarget | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTargets = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

    try {
      const res = await fetch(`${apiUrl}/monitoring/targets`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
      }
    } catch (err) {
      console.warn("Gagal fetch monitoring targets:", err);
      if (!silent) toast.error("Gagal terhubung ke backend server.");
    } finally {
      setLoading(false);
      if (!silent) setRefreshing(false);
    }
  }, []);

  // Real-time Push Notification & SSE Listener
  const { isConnected, permission, requestPermission } = useSlaWebAlerts(() => {
    // Whenever an SLA alert (DOWN or UP) arrives via SSE, refresh the data live!
    fetchTargets(true);
  });

  useEffect(() => {
    fetchTargets();
    // Fallback polling every 10 seconds for live status
    const timer = setInterval(() => {
      fetchTargets(true);
    }, 10000);
    return () => clearInterval(timer);
  }, [fetchTargets]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = query.toLowerCase();
      const matchSearch =
        item.target.name.toLowerCase().includes(q) ||
        item.target.host.toLowerCase().includes(q) ||
        (item.target.routerName && item.target.routerName.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "up" && item.currentStatus === "up") ||
        (statusFilter === "down" && item.currentStatus === "down");

      const matchRouter =
        routerFilter === "all" || item.target.routerId === routerFilter;

      return matchSearch && matchStatus && matchRouter;
    });
  }, [items, query, statusFilter, routerFilter]);

  // Pagination
  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Overall statistics
  const totalCount = items.length;
  const upCount = items.filter((i) => i.currentStatus === "up").length;
  const downCount = items.filter((i) => i.currentStatus === "down").length;
  const avgSla =
    totalCount > 0
      ? items.reduce((acc, curr) => acc + curr.uptimePercent, 0) / totalCount
      : 100;

  // Distinct router options
  const routerOptions = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((i) => {
      if (i.target.routerId && i.target.routerName) {
        map.set(i.target.routerId, i.target.routerName);
      }
    });
    return [
      { value: "all", label: "Semua router" },
      ...Array.from(map.entries()).map(([id, name]) => ({
        value: id,
        label: name,
      })),
    ];
  }, [items]);

  const handleSyncRouter = async (target: MonitoringTarget) => {
    setSyncingId(target.id);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    try {
      const res = await fetch(`${apiUrl}/monitoring/targets/${target.id}/sync`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Rule Netwatch berhasil disinkronkan ke router.");
        fetchTargets(true);
      } else {
        toast.error(json.message || "Gagal sinkron ke router.");
      }
    } catch {
      toast.error("Gagal terhubung ke backend.");
    } finally {
      setSyncingId(null);
    }
  };

  const handleDelete = async (target: MonitoringTarget) => {
    if (!confirm(`Hapus target monitoring "${target.name}"?`)) return;
    setDeletingId(target.id);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    try {
      const res = await fetch(`${apiUrl}/monitoring/targets/${target.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Target monitoring berhasil dihapus.");
        fetchTargets(true);
      } else {
        toast.error(json.message || "Gagal menghapus target.");
      }
    } catch {
      toast.error("Gagal terhubung ke backend.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Monitoring SLA"
        description="Pantau ketersediaan perangkat, gateway, OLT, dan pelanggan berbasis probe Netwatch MikroTik."
      >
        {/* Web Push Permission Button */}
        {permission !== "granted" ? (
          <Button
            type="button"
            variant="outline"
            onPress={requestPermission}
            className="text-xs h-9"
          >
            Aktifkan Notifikasi Web
          </Button>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs text-muted-foreground bg-muted/20">
            <span
              className={`size-2 rounded-full ${
                isConnected ? "bg-[#5cdd8b] animate-pulse" : "bg-zinc-400"
              }`}
            />
            <span>{isConnected ? "Push Web Aktif" : "Menghubungkan..."}</span>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onPress={() => setTelegramOpen(true)}
          className="text-xs h-9"
        >
          Alert Telegram
        </Button>

        <Button
          type="button"
          variant="outline"
          onPress={() => setSyncPppoeOpen(true)}
          className="text-xs h-9"
        >
          Sinkronkan PPPoE
        </Button>

        <Button type="button" onPress={() => setAddOpen(true)} className="text-xs h-9">
          Tambah Target
        </Button>
      </PageHeader>

      {/* KPI Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total target", value: totalCount, tone: "" },
          {
            label: "Normal (UP)",
            value: upCount,
            tone: "text-emerald-600",
          },
          {
            label: "Gangguan (DOWN)",
            value: downCount,
            tone: downCount > 0 ? "text-destructive" : "",
          },
          {
            label: "Rata-rata SLA",
            value: `${avgSla.toFixed(2)}%`,
            tone: "text-emerald-600",
          },
        ].map((item) => (
          <Card key={item.label} className="gap-0 py-0">
            <CardContent className="space-y-1 p-5">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className={`text-2xl font-bold tracking-tight ${item.tone}`}>
                {item.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Table Card */}
      <Card className="gap-0 py-0">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-2 lg:flex-row">
            <div className="relative w-full lg:max-w-sm">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama, host IP, atau router…"
                className="pl-9"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="w-full lg:w-48">
              <SelectField
                value={routerFilter}
                onValueChange={(value) => {
                  setRouterFilter(value);
                  setCurrentPage(1);
                }}
                ariaLabel="Filter router"
                options={routerOptions}
              />
            </div>

            <div className="w-full lg:w-40">
              <SelectField
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
                ariaLabel="Filter status target"
                options={[
                  { value: "all", label: "Semua status" },
                  { value: "up", label: "Normal (UP)" },
                  { value: "down", label: "Gangguan (DOWN)" },
                ]}
              />
            </div>

            <div className="flex items-center gap-2 lg:ml-auto">
              <Button
                variant="outline"
                size="sm"
                onPress={() => fetchTargets()}
                isDisabled={refreshing}
                className="h-9 gap-1.5"
              >
                <RefreshCwIcon className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          <SlaTargetsTable
            items={paginatedRows}
            onViewScript={(target) => setScriptTarget(target)}
            onViewIncidents={(target) => setIncidentTarget(target)}
            onSyncRouter={handleSyncRouter}
            onDelete={handleDelete}
            syncingId={syncingId}
            deletingId={deletingId}
          />

          <DataTablePagination
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <TelegramChannelsDialog
        open={telegramOpen}
        onClose={() => setTelegramOpen(false)}
      />

      <AddTargetDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => fetchTargets(false)}
      />

      <SyncPppoeDialog
        open={syncPppoeOpen}
        onClose={() => setSyncPppoeOpen(false)}
        onSuccess={() => fetchTargets(false)}
      />

      <NetwatchScriptDialog
        target={scriptTarget}
        open={Boolean(scriptTarget)}
        onClose={() => setScriptTarget(null)}
      />

      <IncidentHistoryDialog
        target={incidentTarget}
        open={Boolean(incidentTarget)}
        onClose={() => setIncidentTarget(null)}
      />
    </div>
  );
}
