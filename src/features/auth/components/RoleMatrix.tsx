"use client";

import { SaveIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { permissions } from "@/features/auth/data/permissions";
import { roleLabels } from "@/features/auth/data/users";
import { useRoleMatrix } from "@/features/auth/hooks/useRoleMatrix";

export function RoleMatrix() {
  const { draft, roles, toggle, save } = useRoleMatrix();
  const modules = Array.from(
    new Set(permissions.map((permission) => permission.module))
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        title="Role & akses"
        description="Atur permission per role. Admin selalu memiliki akses penuh."
      >
        <Button onPress={save}>
          <SaveIcon />
          Simpan permission
        </Button>
      </PageHeader>

      <div className="space-y-4">
        {modules.map((module) => (
          <Card key={module} className="gap-0 py-0">
            <CardHeader className="border-b px-5 py-3">
              <CardTitle>{module}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="grid grid-cols-[1fr_repeat(3,80px)] items-center gap-2 bg-muted/40 px-5 py-2 text-xs font-medium text-muted-foreground">
                  <span>Permission</span>
                  {roles.map((role) => (
                    <span key={role} className="text-center">
                      {roleLabels[role]}
                    </span>
                  ))}
                </div>
                {permissions
                  .filter((permission) => permission.module === module)
                  .map((permission) => (
                    <div
                      key={permission.code}
                      className="grid grid-cols-[1fr_repeat(3,80px)] items-center gap-2 px-5 py-2.5 text-sm"
                    >
                      <div>
                        <p className="font-medium">{permission.label}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {permission.code}
                        </p>
                      </div>
                      {roles.map((role) => (
                        <div key={role} className="flex justify-center">
                          <input
                            type="checkbox"
                            aria-label={`${permission.label} untuk ${roleLabels[role]}`}
                            checked={draft[role].includes(permission.code)}
                            disabled={role === "admin"}
                            onChange={() => toggle(role, permission.code)}
                            className="size-4 rounded border-input accent-primary disabled:opacity-60"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
