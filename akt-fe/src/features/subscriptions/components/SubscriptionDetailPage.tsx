"use client";

import {
  ArrowLeftIcon,
  PencilIcon,
  PlusIcon,
  ShieldOffIcon,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subscriptionStatusLabel, subscriptionTone } from "@/features/subscriptions/data/status";
import { useSubscriptionDetail } from "@/features/subscriptions/hooks/useSubscriptionDetail";
import { formatRupiah } from "@/lib/format";
import { CredentialRotateDialog } from "./CredentialRotateDialog";
import { ServiceProvisionDialog } from "./ServiceProvisionDialog";
import { ServicesTable } from "./ServicesTable";
import { SubscriptionActionDialog } from "./SubscriptionActionDialog";
import { SubscriptionCredentialsTable } from "./SubscriptionCredentialsTable";
import { SubscriptionPlanChangeDialog } from "./SubscriptionPlanChangeDialog";
import { SubscriptionStatusTimeline } from "./SubscriptionStatusTimeline";

export function SubscriptionDetailPage({ id }: { id: string }) {
  const {
    subscription,
    services,
    credentials,
    history,
    provisionOpen,
    setProvisionOpen,
    planChangeOpen,
    setPlanChangeOpen,
    action,
    setAction,
    reason,
    setReason,
    confirmAction,
    provisionService,
    terminateService,
    rotateTarget,
    setRotateTarget,
    newSecret,
    setNewSecret,
    rotateCredentialAction,
  } = useSubscriptionDetail(id);

  if (!subscription) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">Langganan tidak ditemukan</p>
        <LinkButton href="/dashboard/pelanggan">
          Kembali ke daftar pelanggan
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="space-y-3">
        <LinkButton
          href={`/dashboard/pelanggan/${subscription.customerId}`}
          variant="ghost"
          size="sm"
          className="-ml-2"
        >
          <ArrowLeftIcon />
          Kembali ke pelanggan
        </LinkButton>
        <PageHeader
          title={subscription.customerName}
          description={`${subscription.number} · ${subscription.branchName}`}
        >
          <StatusBadge tone={subscriptionTone[subscription.status]}>
            {subscriptionStatusLabel[subscription.status]}
          </StatusBadge>
          {subscription.status !== "terminated" ? (
            <Button
              variant="outline"
              onPress={() => setAction("terminate")}
            >
              <ShieldOffIcon />
              Terminasi
            </Button>
          ) : null}
        </PageHeader>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Paket", value: subscription.planName },
          { label: "Biaya bulanan", value: formatRupiah(subscription.monthlyFee) },
          { label: "Jatuh tempo", value: `Tanggal ${subscription.dueDay}` },
          { label: "Outstanding", value: formatRupiah(subscription.outstanding) },
        ].map((item) => (
          <Card key={item.label} className="gap-0 py-0">
            <CardContent className="space-y-1 p-5">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-lg font-bold tracking-tight">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-0 py-0 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
            <CardTitle>Services</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onPress={() => setPlanChangeOpen(true)}>
                <PencilIcon />
                Ubah paket
              </Button>
              <Button size="sm" onPress={() => setProvisionOpen(true)}>
                <PlusIcon />
                Tambah service
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <ServicesTable
              services={services}
              onProvision={(service) => provisionService(service.id)}
              onTerminate={(service) => terminateService(service.id)}
            />
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle>Riwayat status</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <SubscriptionStatusTimeline history={history} />
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Credential service</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <SubscriptionCredentialsTable
            credentials={credentials}
            onRotate={(credential) => {
              setRotateTarget(credential);
              setNewSecret("");
            }}
          />
        </CardContent>
      </Card>

      <ServiceProvisionDialog
        open={provisionOpen}
        subscriptionId={subscription.id}
        branchId={subscription.branchId}
        onClose={() => setProvisionOpen(false)}
      />
      <SubscriptionPlanChangeDialog
        open={planChangeOpen}
        subscriptionId={subscription.id}
        currentPlanId={subscription.planId}
        onClose={() => setPlanChangeOpen(false)}
      />
      <SubscriptionActionDialog
        action={action}
        subscription={subscription}
        reason={reason}
        onReasonChange={setReason}
        onConfirm={confirmAction}
        onCancel={() => setAction(null)}
      />
      <CredentialRotateDialog
        open={Boolean(rotateTarget)}
        username={rotateTarget?.username ?? ""}
        secret={newSecret}
        onSecretChange={setNewSecret}
        onSave={rotateCredentialAction}
        onClose={() => setRotateTarget(null)}
      />
    </div>
  );
}
