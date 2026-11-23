import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useAuditStore } from "@/features/audit/store/audit-store";
import type { Branch } from "../data/branches";

import { generateUUID } from "@/lib/uuid";

type BranchState = {
  branches: Branch[];
  fetchBranches: () => Promise<void>;
  addBranch: (input: Omit<Branch, "id" | "customerCount">) => Promise<Branch | null>;
  updateBranch: (id: string, patch: Partial<Branch>) => Promise<Branch | null>;
  toggleBranch: (id: string) => Promise<Branch | null>;
  deleteBranch: (id: string) => Promise<{ ok: boolean; message?: string }>;
  resetBranches: () => void;
};

function id() {
  return generateUUID();
}

function audit(action: string, entityId: string, description: string, branch: string) {
  useAuditStore.getState().addAudit({
    action,
    entityType: "branch",
    entityId,
    actor: "Administrator",
    branch,
    description,
  });
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set, get) => ({
      branches: [],

      fetchBranches: async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        try {
          const res = await fetch(`${apiUrl}/branches`);
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            set({ branches: json.data });
          }
        } catch (err) {
          console.warn("Gagal mengambil data cabang dari backend:", err);
        }
      },

      addBranch: async (input) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        try {
          const res = await fetch(`${apiUrl}/branches`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          });
          const json = await res.json();
          if (json.success && json.data) {
            const newBranch: Branch = json.data;
            set((state) => ({ branches: [newBranch, ...state.branches] }));
            audit("branch.created", newBranch.code, `Cabang ${newBranch.name} ditambahkan via API.`, newBranch.code);
            return newBranch;
          }
        } catch (err) {
          console.warn("Backend addBranch failed, fallback local:", err);
        }

        const fallbackBranch: Branch = { ...input, id: id(), customerCount: 0 };
        set((state) => ({ branches: [fallbackBranch, ...state.branches] }));
        audit("branch.created", fallbackBranch.code, `Cabang ${fallbackBranch.name} ditambahkan (local).`, fallbackBranch.code);
        return fallbackBranch;
      },

      updateBranch: async (branchId, patch) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        try {
          const res = await fetch(`${apiUrl}/branches/${branchId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
          });
          const json = await res.json();
          if (json.success && json.data) {
            const updated: Branch = json.data;
            set((state) => ({
              branches: state.branches.map((b) => (b.id === branchId ? updated : b)),
            }));
            audit("branch.updated", updated.code, `Cabang ${updated.name} diperbarui via API.`, updated.code);
            return updated;
          }
        } catch (err) {
          console.warn("Backend updateBranch failed, fallback local:", err);
        }

        set((state) => ({
          branches: state.branches.map((branch) =>
            branch.id === branchId ? { ...branch, ...patch } : branch
          ),
        }));
        const branch = get().branches.find((item) => item.id === branchId);
        audit(
          "branch.updated",
          branch?.code ?? branchId,
          `Cabang ${branch?.name ?? branchId} diperbarui (local).`,
          branch?.code ?? "JKT-01"
        );
        return branch ?? null;
      },

      toggleBranch: async (branchId) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        try {
          const res = await fetch(`${apiUrl}/branches/${branchId}/toggle`, {
            method: "PATCH",
          });
          const json = await res.json();
          if (json.success && json.data) {
            const updated: Branch = json.data;
            set((state) => ({
              branches: state.branches.map((b) => (b.id === branchId ? updated : b)),
            }));
            audit(
              updated.isActive ? "branch.activated" : "branch.deactivated",
              updated.code,
              `Status cabang ${updated.name} diubah.`,
              updated.code
            );
            return updated;
          }
        } catch (err) {
          console.warn("Backend toggleBranch failed, fallback local:", err);
        }

        set((state) => ({
          branches: state.branches.map((branch) =>
            branch.id === branchId
              ? { ...branch, isActive: !branch.isActive }
              : branch
          ),
        }));
        const branch = get().branches.find((item) => item.id === branchId);
        audit(
          branch?.isActive ? "branch.activated" : "branch.deactivated",
          branch?.code ?? branchId,
          `Status cabang ${branch?.name ?? branchId} diubah (local).`,
          branch?.code ?? "JKT-01"
        );
        return branch ?? null;
      },

      deleteBranch: async (branchId) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        try {
          await fetch(`${apiUrl}/branches/${branchId}`, { method: "DELETE" });
        } catch (err) {
          console.warn("Backend deleteBranch failed:", err);
        }

        const branch = get().branches.find((item) => item.id === branchId);
        set((state) => ({
          branches: state.branches.filter((item) => item.id !== branchId),
        }));
        audit(
          "branch.deleted",
          branch?.code ?? branchId,
          `Cabang ${branch?.name ?? branchId} dihapus.`,
          branch?.code ?? "JKT-01"
        );
        return { ok: true };
      },

      resetBranches: () => set({ branches: [] }),
    }),
    { name: "muranet-branches-v2", skipHydration: true }
  )
);
