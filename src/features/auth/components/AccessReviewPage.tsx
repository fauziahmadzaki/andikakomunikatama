"use client";

import { CheckCircle2Icon } from "lucide-react";

import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAccessReview } from "@/features/auth/hooks/useAccessReview";
import { AccessReviewTable } from "./AccessReviewTable";

export function AccessReviewPage() {
  const {
    users,
    summary,
    reviewed,
    review,
    confirmUser,
    setConfirmUser,
    confirmRevoke,
    finishReview,
  } = useAccessReview();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        title="Access review"
        description="Tinjau ulang akses staff secara berkala."
      >
        <Button onPress={finishReview}>
          <CheckCircle2Icon />
          Tandai selesai
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total pengguna", value: summary.total },
          { label: "Aktif", value: summary.active },
          { label: "Privileged", value: summary.privileged },
          { label: "Belum pernah login", value: summary.noLogin },
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
        <CardContent className="p-4">
          <AccessReviewTable
            users={users}
            reviewed={reviewed}
            onReview={review}
            onRevoke={setConfirmUser}
          />
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={Boolean(confirmUser)}
        title="Cabut akses pengguna?"
        description={`${confirmUser?.name ?? "Pengguna"} tidak akan bisa login sampai diaktifkan kembali.`}
        confirmLabel="Cabut akses"
        destructive
        onConfirm={confirmRevoke}
        onCancel={() => setConfirmUser(null)}
      />
    </div>
  );
}
