"use client";

import { PlusIcon, SearchIcon } from "lucide-react";

import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { SelectField } from "@/components/shared/SelectField";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRoutersPage } from "@/features/network/hooks/useRoutersPage";
import { RouterDialog } from "./DeviceDialogs";
import { RouterSecretDialog } from "./RouterSecretDialog";
import { RoutersTable } from "./RoutersTable";

export function RoutersPage() {
  const {
    routers,
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
    viewRouter,
  } = useRoutersPage();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Router"
        description="Kelola router, lokasi, koneksi API, credential, dan pelanggan terhubung."
      >
        <Button onPress={openCreate}>
          <PlusIcon />
          Tambah router
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total router", value: stats.total },
          { label: "Aktif", value: stats.active },
          { label: "Maintenance", value: stats.maintenance },
          { label: "Pelanggan terhubung", value: stats.connectedCustomers },
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
                placeholder="Cari nama, IP address, atau user…"
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="w-full lg:w-48">
              <SelectField
                value={branchFilter}
                onValueChange={setBranchFilter}
                ariaLabel="Filter lokasi router"
                options={[
                  { value: "all", label: "Semua lokasi" },
                  ...branches.map((branch) => ({
                    value: branch.id,
                    label: branch.name,
                  })),
                ]}
              />
            </div>
            <div className="w-full lg:w-44">
              <SelectField
                value={statusFilter}
                onValueChange={setStatusFilter}
                ariaLabel="Filter status router"
                options={[
                  { value: "all", label: "Semua status" },
                  { value: "active", label: "Aktif" },
                  { value: "inactive", label: "Nonaktif" },
                  { value: "maintenance", label: "Maintenance" },
                  { value: "retired", label: "Retired" },
                ]}
              />
            </div>
          </div>

          <RoutersTable
            routers={routers}
            onView={(item) => viewRouter(item.id)}
            onEdit={(item) => openEdit(item)}
            onTest={test}
            onRotate={(item) => {
              setRotateRouter(item);
              setNewSecret("");
            }}
            onDelete={(item) => setConfirmRouter(item)}
          />
        </CardContent>
      </Card>

      {dialogOpen ? (
        <RouterDialog
          key={editingRouter?.id ?? "new-router"}
          open={dialogOpen}
          router={editingRouter}
          onClose={closeDialog}
        />
      ) : null}

      <RouterSecretDialog
        open={Boolean(rotateRouter)}
        routerName={rotateRouter?.name ?? ""}
        secret={newSecret}
        onSecretChange={setNewSecret}
        onSave={confirmRotate}
        onClose={() => setRotateRouter(null)}
      />

      <ConfirmationDialog
        open={Boolean(confirmRouter)}
        title="Hapus router?"
        description={
          confirmRouter
            ? `${confirmRouter.name} akan dihapus. Router dengan service atau device terhubung tidak bisa dihapus.`
            : ""
        }
        confirmLabel="Hapus"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setConfirmRouter(null)}
      />
    </div>
  );
}
