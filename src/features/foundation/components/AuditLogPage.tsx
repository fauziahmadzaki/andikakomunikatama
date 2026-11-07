"use client";

import { SearchIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { SelectField } from "@/components/shared/SelectField";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuditLog } from "@/features/foundation/hooks/useAuditLog";
import { AuditLogTable } from "./AuditLogTable";

export function AuditLogPage() {
  const { query, setQuery, action, setAction, actions, filtered } = useAuditLog();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Audit log"
        description="Jejak aktivitas sistem yang tidak dapat diubah."
      />

      <Card className="gap-0 py-0">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative w-full sm:max-w-sm">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari aksi, aktor, atau entitas…"
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="w-full sm:w-56">
              <SelectField
                value={action}
                onValueChange={setAction}
                ariaLabel="Filter aksi audit"
                options={[
                  { value: "all", label: "Semua aksi" },
                  ...actions.map((item) => ({ value: item, label: item })),
                ]}
              />
            </div>
          </div>

          <AuditLogTable logs={filtered} />
        </CardContent>
      </Card>
    </div>
  );
}
