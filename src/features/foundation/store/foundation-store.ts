import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  seedAuditLogs,
  seedBranches,
  seedCompany,
  seedSequences,
  seedSettings,
} from "../data/seed";
import type {
  AuditLog,
  Branch,
  CompanyProfile,
  NumberSequence,
  SettingGroup,
} from "../data/types";

type AuditInput = Omit<AuditLog, "id" | "createdAt"> & {
  createdAt?: string;
};

type FoundationState = {
  company: CompanyProfile;
  branches: Branch[];
  settings: SettingGroup[];
  sequences: NumberSequence[];
  auditLogs: AuditLog[];
  updateCompany: (patch: Partial<CompanyProfile>, actor?: string) => void;
  addBranch: (
    input: Omit<Branch, "id" | "customerCount">,
    actor?: string
  ) => void;
  updateBranch: (id: string, patch: Partial<Branch>, actor?: string) => void;
  toggleBranch: (id: string, actor?: string) => void;
  updateSetting: (key: string, value: string | number | boolean) => void;
  updateSequence: (
    id: string,
    patch: Pick<NumberSequence, "prefix" | "nextNumber" | "padding">,
    actor?: string
  ) => void;
  addAudit: (input: AuditInput) => void;
  resetFoundation: () => void;
};

function now() {
  return new Date().toISOString();
}

function id() {
  return crypto.randomUUID();
}

export const useFoundationStore = create<FoundationState>()(
  persist(
    (set, get) => ({
      company: seedCompany,
      branches: seedBranches,
      settings: seedSettings,
      sequences: seedSequences,
      auditLogs: seedAuditLogs,

      updateCompany: (patch, actor = "Administrator") => {
        set((state) => ({ company: { ...state.company, ...patch } }));
        get().addAudit({
          action: "company.updated",
          entityType: "company",
          entityId: "company",
          actor,
          branch: "JKT-01",
          description: "Profil perusahaan diperbarui.",
        });
      },

      addBranch: (input, actor = "Administrator") => {
        const branch: Branch = { ...input, id: id(), customerCount: 0 };
        set((state) => ({ branches: [branch, ...state.branches] }));
        get().addAudit({
          action: "branch.created",
          entityType: "branch",
          entityId: branch.code,
          actor,
          branch: branch.code,
          description: `Cabang ${branch.name} ditambahkan.`,
        });
      },

      updateBranch: (branchId, patch, actor = "Administrator") => {
        set((state) => ({
          branches: state.branches.map((branch) =>
            branch.id === branchId ? { ...branch, ...patch } : branch
          ),
        }));
        const branch = get().branches.find((item) => item.id === branchId);
        get().addAudit({
          action: "branch.updated",
          entityType: "branch",
          entityId: branch?.code ?? branchId,
          actor,
          branch: branch?.code ?? "JKT-01",
          description: `Cabang ${branch?.name ?? branchId} diperbarui.`,
        });
      },

      toggleBranch: (branchId, actor = "Administrator") => {
        set((state) => ({
          branches: state.branches.map((branch) =>
            branch.id === branchId
              ? { ...branch, isActive: !branch.isActive }
              : branch
          ),
        }));
        const branch = get().branches.find((item) => item.id === branchId);
        get().addAudit({
          action: branch?.isActive ? "branch.activated" : "branch.deactivated",
          entityType: "branch",
          entityId: branch?.code ?? branchId,
          actor,
          branch: branch?.code ?? "JKT-01",
          description: `Status cabang ${branch?.name ?? branchId} diubah.`,
        });
      },

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

      updateSequence: (sequenceId, patch, actor = "Administrator") => {
        set((state) => ({
          sequences: state.sequences.map((sequence) =>
            sequence.id === sequenceId
              ? { ...sequence, ...patch }
              : sequence
          ),
        }));
        const sequence = get().sequences.find((item) => item.id === sequenceId);
        get().addAudit({
          action: "sequence.updated",
          entityType: "number_sequence",
          entityId: sequence?.key ?? sequenceId,
          actor,
          branch: "JKT-01",
          description: `Penomoran ${sequence?.label ?? sequenceId} diperbarui.`,
        });
      },

      addAudit: (input) => {
        const entry: AuditLog = {
          ...input,
          id: id(),
          createdAt: input.createdAt ?? now(),
        };
        set((state) => ({ auditLogs: [entry, ...state.auditLogs].slice(0, 100) }));
      },

      resetFoundation: () => {
        set({
          company: seedCompany,
          branches: seedBranches,
          settings: seedSettings,
          sequences: seedSequences,
          auditLogs: seedAuditLogs,
        });
      },
    }),
    { name: "muranet-foundation", skipHydration: true }
  )
);
