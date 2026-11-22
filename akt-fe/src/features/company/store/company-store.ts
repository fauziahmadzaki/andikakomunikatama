import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useAuditStore } from "@/features/audit/store/audit-store";
import { seedCompany, type CompanyProfile } from "../data/company";

type CompanyState = {
  company: CompanyProfile;
  updateCompany: (patch: Partial<CompanyProfile>, actor?: string) => void;
  resetCompany: () => void;
};

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      company: seedCompany,

      updateCompany: (patch, actor = "Administrator") => {
        set((state) => ({ company: { ...state.company, ...patch } }));
        useAuditStore.getState().addAudit({
          action: "company.updated",
          entityType: "company",
          entityId: "company",
          actor,
          branch: "JKT-01",
          description: "Profil perusahaan diperbarui.",
        });
      },

      resetCompany: () => set({ company: seedCompany }),
    }),
    { name: "muranet-company", skipHydration: true }
  )
);
