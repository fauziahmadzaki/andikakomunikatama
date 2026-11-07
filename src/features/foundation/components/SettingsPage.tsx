"use client";

import { SaveIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { SelectField } from "@/components/shared/SelectField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSettingsForm } from "@/features/foundation/hooks/useSettingsForm";

export function SettingsPage() {
  const { settings, draft, setValue, save } = useSettingsForm();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        title="Pengaturan sistem"
        description="Konfigurasi operasional tanpa perlu deploy ulang."
      >
        <Button onPress={save}>
          <SaveIcon />
          Simpan pengaturan
        </Button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        {settings.map((group) => (
          <Card key={group.id} className="gap-0 py-0">
            <CardHeader className="border-b px-5 py-4">
              <CardTitle>{group.title}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {group.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {group.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label htmlFor={field.key} className="text-sm font-medium">
                    {field.label}
                  </label>

                  {field.type === "boolean" ? (
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input
                        id={field.key}
                        type="checkbox"
                        checked={Boolean(draft[field.key])}
                        onChange={(event) =>
                          setValue(field.key, event.target.checked)
                        }
                        className="size-4 rounded border-input accent-primary"
                      />
                      Aktif
                    </label>
                  ) : field.type === "select" ? (
                    <SelectField
                      value={String(draft[field.key] ?? "")}
                      onValueChange={(value) => setValue(field.key, value)}
                      ariaLabel={field.label}
                      options={(field.options ?? []).map((option) => ({
                        value: option,
                        label: option,
                      }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        id={field.key}
                        type={field.type === "number" ? "number" : "text"}
                        value={String(draft[field.key] ?? "")}
                        onChange={(event) =>
                          setValue(
                            field.key,
                            field.type === "number"
                              ? Number(event.target.value)
                              : event.target.value
                          )
                        }
                      />
                      {field.suffix ? (
                        <span className="text-xs text-muted-foreground">
                          {field.suffix}
                        </span>
                      ) : null}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {field.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
