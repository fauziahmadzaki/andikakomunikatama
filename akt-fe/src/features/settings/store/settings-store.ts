import { create } from "zustand";
import { persist } from "zustand/middleware";

import { seedSettings, type SettingGroup } from "../data/settings";

type SettingsState = {
  settings: SettingGroup[];
  updateSetting: (key: string, value: string | number | boolean) => void;
  resetSettings: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: seedSettings,

      updateSetting: (key, value) => {
        set((state) => ({
          settings: state.settings.map((group) => ({
            ...group,
            fields: group.fields.map((field) =>
              field.key === key ? { ...field, value } : field
            ),
          })),
        }));
      },

      resetSettings: () => set({ settings: seedSettings }),
    }),
    { name: "muranet-settings", skipHydration: true }
  )
);
