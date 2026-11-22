"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  SaveIcon,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePlanProfileWizard } from "@/features/plan-profiles/hooks/usePlanProfileWizard";
import { PlanProfileBandwidthStep } from "./PlanProfileBandwidthStep";
import { PlanProfileConnectionStep } from "./PlanProfileConnectionStep";
import { PlanProfileGeneralStep } from "./PlanProfileGeneralStep";
import { PlanProfileStepper } from "./PlanProfileStepper";
import { PlanProfileSummaryStep } from "./PlanProfileSummaryStep";

export function PlanProfileWizard({ profileId }: { profileId?: string }) {
  const {
    profile,
    isEditing,
    step,
    form,
    set,
    error,
    routers,
    pools,
    parentQueues,
    router,
    selectedPool,
    selectedParentQueue,
    preview,
    next,
    back,
    save,
  } = usePlanProfileWizard(profileId);

  if (profileId && !profile) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">Paket tidak ditemukan</p>
        <LinkButton href="/dashboard/paket">Kembali ke daftar paket</LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="space-y-3">
        <LinkButton
          href="/dashboard/paket"
          variant="ghost"
          size="sm"
          className="-ml-2"
        >
          <ArrowLeftIcon />
          Kembali ke daftar paket
        </LinkButton>
        <PageHeader
          title={isEditing ? "Edit paket" : "Tambah paket"}
          description="Lengkapi pengaturan paket secara bertahap sebelum disimpan."
        />
      </div>

      <Card className="gap-0 py-0">
        <CardContent className="space-y-6 p-5">
          <PlanProfileStepper step={step} />

          {step === 1 ? (
            <PlanProfileGeneralStep form={form} set={set} />
          ) : null}

          {step === 2 ? (
            <PlanProfileConnectionStep
              form={form}
              set={set}
              routers={routers}
              pools={pools}
              parentQueues={parentQueues}
              router={router}
              selectedPool={selectedPool}
              selectedParentQueue={selectedParentQueue}
            />
          ) : null}

          {step === 3 ? (
            <PlanProfileBandwidthStep
              form={form}
              set={set}
              preview={preview}
            />
          ) : null}

          {step === 4 ? (
            <PlanProfileSummaryStep
              form={form}
              router={router}
              selectedPool={selectedPool}
              selectedParentQueue={selectedParentQueue}
              preview={preview}
            />
          ) : null}

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-between border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onPress={back}
              isDisabled={step === 1}
            >
              <ArrowLeftIcon />
              Kembali
            </Button>

            {step < 4 ? (
              <Button type="button" onPress={next}>
                Lanjut
                <ArrowRightIcon />
              </Button>
            ) : (
              <Button type="button" onPress={save}>
                <SaveIcon />
                {isEditing ? "Simpan perubahan" : "Simpan paket"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
