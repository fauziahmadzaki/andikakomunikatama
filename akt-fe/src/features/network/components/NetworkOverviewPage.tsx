"use client";

import { RefreshCwIcon, RouterIcon, ServerIcon, BoxesIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNetworkOverview } from "@/features/network/hooks/useNetworkOverview";
import { formatDateTime } from "@/lib/format";
import { OltDialog } from "./DeviceDialogs";
import { OltsTable, RoutersTable } from "./DeviceTables";
import { CredentialRotateDialog } from "./CredentialRotateDialog";

export function NetworkOverviewPage() {
  const {
    routers,
    olts,
    acsServers,
    passiveDevices,
    inventory,
    oltOpen,
    setOltOpen,
    credentialDevice,
    setCredentialDevice,
    test,
    sync,
  } = useNetworkOverview();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title="Jaringan"
        description="Ringkasan router, OLT, ACS, dan perangkat pasif."
      >
        <Button variant="outline" onPress={() => setOltOpen(true)}>
          <ServerIcon />
          Tambah OLT
        </Button>
        <LinkButton href="/dashboard/jaringan/router">
          <RouterIcon />
          Kelola router
        </LinkButton>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Router aktif",
            value: routers.filter((router) => router.status === "active").length,
            icon: RouterIcon,
          },
          {
            label: "OLT aktif",
            value: olts.filter((olt) => olt.status === "active").length,
            icon: ServerIcon,
          },
          {
            label: "Perangkat pasif",
            value: passiveDevices.length,
            icon: BoxesIcon,
          },
          {
            label: "Stok inventaris",
            value: inventory.filter((item) => item.status === "in_stock").length,
            icon: BoxesIcon,
          },
        ].map((item) => (
          <Card key={item.label} className="gap-0 py-0">
            <CardContent className="flex items-center justify-between p-5">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold tracking-tight">{item.value}</p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Router</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <RoutersTable
            routers={routers}
            onTest={(router) => test(router.id, "router")}
            onRotate={(router) =>
              setCredentialDevice({
                id: router.id,
                name: router.name,
                type: "router",
              })
            }
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>OLT</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <OltsTable
            olts={olts}
            onTest={(olt) => test(olt.id, "olt")}
            onRotate={(olt) =>
              setCredentialDevice({
                id: olt.id,
                name: olt.name,
                type: "olt",
              })
            }
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>ACS Server</CardTitle>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {acsServers.map((acs) => (
            <div
              key={acs.id}
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{acs.name}</p>
                <p className="text-xs text-muted-foreground">{acs.baseUrl}</p>
                <p className="text-xs text-muted-foreground">
                  Sinkron terakhir: {formatDateTime(acs.lastSyncAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge tone={acs.status === "healthy" ? "success" : "warning"}>
                  {acs.status}
                </StatusBadge>
                <Button variant="outline" size="sm" onPress={() => sync(acs.id)}>
                  <RefreshCwIcon />
                  Sinkronkan
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <OltDialog open={oltOpen} onClose={() => setOltOpen(false)} />
      <CredentialRotateDialog
        device={credentialDevice}
        onClose={() => setCredentialDevice(null)}
      />
    </div>
  );
}
