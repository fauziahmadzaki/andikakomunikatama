import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PreviewSpecimen({
  title,
  description,
  contentClassName,
  children,
}: {
  title: string;
  description?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-1 border-b px-4 py-3">
        <p className="text-sm font-medium">{title}</p>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className={cn("p-4 sm:p-5", contentClassName)}>{children}</div>
    </div>
  );
}
