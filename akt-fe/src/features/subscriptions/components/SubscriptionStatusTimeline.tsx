"use client";

import { StatusBadge } from "@/components/shared/StatusBadge";
import type { SubscriptionHistory } from "@/features/subscriptions/data/types";
import { subscriptionTone } from "@/features/subscriptions/data/status";
import { formatDateTime } from "@/lib/format";

export function SubscriptionStatusTimeline({
  history,
}: {
  history: SubscriptionHistory[];
}) {
  return (
    <div className="space-y-3">
      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada riwayat status.</p>
      ) : (
        history.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="mt-1 size-2 rounded-full bg-primary" />
              <span className="mt-1 w-px flex-1 bg-border" />
            </div>
            <div className="pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={subscriptionTone[item.status]}>
                  {item.status}
                </StatusBadge>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(item.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-sm">{item.reason}</p>
              <p className="text-xs text-muted-foreground">{item.actor}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
