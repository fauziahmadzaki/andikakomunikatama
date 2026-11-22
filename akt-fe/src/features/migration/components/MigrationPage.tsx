"use client";

import { PlayIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMigrationPage } from "@/features/migration/hooks/useMigrationPage";
import { formatDateTime } from "@/lib/format";

export function MigrationPage() {
  const { steps, lastRunAt, progress, run } = useMigrationPage();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        title="Migrasi & cutover"
        description="Checklist migrasi legacy, dry-run, dan kesiapan cutover."
      >
        <Button onPress={run}>
          <PlayIcon />
          Jalankan dry-run
        </Button>
      </PageHeader>

      <Card className="gap-0 py-0">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress migrasi</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Dry-run terakhir: {formatDateTime(lastRunAt)}
          </p>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Checklist</CardTitle>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex flex-col gap-2 p-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="space-y-1">
                <p className="font-medium">{step.title}</p>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                {step.count ? (
                  <p className="text-xs text-muted-foreground">
                    {step.count.toLocaleString("id-ID")} baris
                  </p>
                ) : null}
              </div>
              <StatusBadge
                tone={
                  step.status === "completed"
                    ? "success"
                    : step.status === "failed"
                      ? "danger"
                      : "neutral"
                }
              >
                {step.status}
              </StatusBadge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
