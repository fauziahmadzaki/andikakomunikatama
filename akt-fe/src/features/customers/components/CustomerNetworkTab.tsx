"use client";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNetworkStore } from "@/features/network/store/network-store";
import { usePlanProfileStore } from "@/features/plan-profiles/store/plan-profile-store";
import {
  serviceStatusLabel,
  serviceStatusTone,
} from "@/features/subscriptions/data/status";
import type {
  ConnectionType,
  ProvisionMethod,
  SubscriptionService,
} from "@/features/subscriptions/data/types";

const connectionLabel: Record<ConnectionType, string> = {
  static: "Static",
  dhcp: "DHCP",
  pppoe: "PPPoE",
  hotspot: "Hotspot",
};

const provisionLabel: Record<ProvisionMethod, string> = {
  new: "Baru",
  sync: "Sinkronisasi",
};

function DetailItem({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-words">{value || "-"}</p>
    </div>
  );
}

export function CustomerNetworkTab({
  services,
}: {
  services: SubscriptionService[];
}) {
  const routers = useNetworkStore((state) => state.routers);
  const olts = useNetworkStore((state) => state.olts);
  const packages = usePlanProfileStore((state) => state.profiles);

  if (services.length === 0) {
    return (
      <Card className="gap-0 py-0">
        <CardContent className="p-5 text-sm text-muted-foreground">
          Belum ada data jaringan.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {services.map((service) => {
        const installation = service.installation;
        const connectionType = service.connectionType ?? service.serviceType;

        return (
          <Card key={service.id} className="gap-0 py-0">
            <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
              <CardTitle>
                {connectionLabel[connectionType as ConnectionType] ??
                  service.serviceType}
              </CardTitle>
              <StatusBadge tone={serviceStatusTone[service.status]}>
                {serviceStatusLabel[service.status]}
              </StatusBadge>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DetailItem
                  label="Router"
                  value={
                    routers.find((item) => item.id === service.routerId)?.name
                  }
                />
                <DetailItem
                  label="OLT"
                  value={olts.find((item) => item.id === service.oltId)?.name}
                />
                <DetailItem
                  label="Metode"
                  value={
                    service.provisionMethod
                      ? provisionLabel[service.provisionMethod]
                      : undefined
                  }
                />
                <DetailItem
                  label="Paket"
                  value={
                    packages.find(
                      (item) => item.id === service.planProfileId
                    )?.name
                  }
                />
                <DetailItem
                  label="Parent queue"
                  value={service.parentQueueName}
                />
                <DetailItem label="Username / queue" value={service.username} />
                <DetailItem label="Target IP" value={service.targetIp} />
                <DetailItem
                  label="Terpasang"
                  value={service.installedAt}
                />
              </div>

              <div className="space-y-3 border-t pt-4">
                <p className="text-sm font-medium">Infra & material</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <DetailItem label="SN ONU" value={installation?.snOnu} />
                  <DetailItem label="Merek ONU" value={installation?.onuBrand} />
                  <DetailItem
                    label="Serial ONU"
                    value={installation?.onuSerial}
                  />
                  <DetailItem label="ODC" value={installation?.odc} />
                  <DetailItem label="ODP" value={installation?.odp} />
                  <DetailItem
                    label="Port ODP"
                    value={
                      installation?.odpPort
                        ? `Port ${installation.odpPort}`
                        : undefined
                    }
                  />
                  <DetailItem
                    label="Panjang kabel"
                    value={
                      installation?.cableLengthM
                        ? `${installation.cableLengthM} meter`
                        : undefined
                    }
                  />
                  <DetailItem
                    label="Jumlah connector"
                    value={installation?.connectorCount}
                  />
                  <DetailItem
                    label="Catatan material"
                    value={installation?.materialNotes}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
