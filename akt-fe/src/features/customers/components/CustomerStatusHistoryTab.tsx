"use client";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  customerStatusLabel,
  customerStatusTone,
} from "@/features/customers/data/status";
import type { CustomerStatusHistory } from "@/features/customers/data/types";
import { formatDateTime } from "@/lib/format";

export function CustomerStatusHistoryTab({
  history,
}: {
  history: CustomerStatusHistory[];
}) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle>Riwayat status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada riwayat.</p>
        ) : (
          history.map((entry) => (
            <div key={entry.id} className="rounded-lg border p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusBadge tone={customerStatusTone[entry.status]}>
                  {customerStatusLabel[entry.status]}
                </StatusBadge>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(entry.changedAt)}
                </span>
              </div>
              <p className="mt-2">{entry.reason}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                oleh {entry.changedBy}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
