"use client";

import { PlusIcon, SearchIcon, TagsIcon } from "lucide-react";

import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { SelectField } from "@/components/shared/SelectField";
import { LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePlanProfilesPage } from "@/features/plan-profiles/hooks/usePlanProfilesPage";
import { PlanProfilesTable } from "./PlanProfilesTable";

export function PlanProfilesPage() {
  const {
    profiles,
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
  } = usePlanProfilesPage();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Paket"
        description="Kelola paket PPPoE, hotspot, dan template simple queue yang terhubung ke router MikroTik."
      >
        {canViewDiscounts ? (
          <LinkButton href="/dashboard/paket/diskon" variant="outline">
            <TagsIcon />
            Diskon
          </LinkButton>
        ) : null}
        {canCreate ? (
          <LinkButton href="/dashboard/paket/baru">
            <PlusIcon />
            Tambah paket
          </LinkButton>
        ) : null}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total paket", value: stats.total },
          { label: "Paket PPPoE", value: stats.pppoe },
          { label: "Paket hotspot", value: stats.hotspot },
          { label: "Paket lainnya", value: stats.other },
        ].map((item) => (
          <Card key={item.label} className="gap-0 py-0">
            <CardContent className="space-y-1 p-5">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-bold tracking-tight">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="gap-0 py-0">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-2 lg:flex-row">
            <div className="relative w-full lg:max-w-sm">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau deskripsi paket…"
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="w-full lg:w-40">
              <SelectField
                value={typeFilter}
                onValueChange={setTypeFilter}
                ariaLabel="Filter tipe paket"
                options={[
                  { value: "all", label: "Semua tipe" },
                  { value: "pppoe", label: "PPPoE" },
                  { value: "hotspot", label: "Hotspot" },
                  { value: "other", label: "Lainnya" },
                ]}
              />
            </div>
            <div className="w-full lg:w-52">
              <SelectField
                value={routerFilter}
                onValueChange={setRouterFilter}
                ariaLabel="Filter router paket"
                options={[
                  { value: "all", label: "Semua router" },
                  ...routers.map((router) => ({
                    value: router.id,
                    label: router.name,
                  })),
                ]}
              />
            </div>
          </div>

          <PlanProfilesTable
            profiles={profiles}
            routerName={routerName}
            poolName={poolName}
            queueName={queueName}
            isLoading={isLoading}
            onEdit={canEdit ? editProfile : undefined}
            onSync={sync}
            onToggle={toggle}
            onDelete={(profile) => setConfirmProfile(profile)}
          />
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={Boolean(confirmProfile)}
        title="Hapus paket?"
        description={`Paket ${confirmProfile?.name ?? ""} akan dihapus permanen.`}
        confirmLabel="Hapus"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setConfirmProfile(null)}
      />
    </div>
  );
}
