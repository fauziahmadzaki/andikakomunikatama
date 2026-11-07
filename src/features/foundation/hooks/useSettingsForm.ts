"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useFoundationStore } from "@/features/foundation/store/foundation-store";

export function useSettingsForm() {
  const settings = useFoundationStore((state) => state.settings);
  const updateSetting = useFoundationStore((state) => state.updateSetting);
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
