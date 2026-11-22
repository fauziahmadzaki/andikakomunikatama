"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useSettingsStore } from "@/features/settings/store/settings-store";

export function useSettingsForm() {
  const settings = useSettingsStore((state) => state.settings);
  const updateSetting = useSettingsStore((state) => state.updateSetting);
  const [draft, setDraft] = useState<Record<string, string | number | boolean>>(
    () =>
      Object.fromEntries(
        settings.flatMap((group) =>
          group.fields.map((field) => [field.key, field.value])
        )
      )
  );

  function setValue(key: string, value: string | number | boolean) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function save() {
    Object.entries(draft).forEach(([key, value]) => updateSetting(key, value));
    toast.success("Pengaturan sistem disimpan.");
  }

  return { settings, draft, setValue, save };
}
