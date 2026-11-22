import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useAuditStore } from "@/features/audit/store/audit-store";
import { seedSequences, type NumberSequence } from "../data/sequences";

type SequenceState = {
  sequences: NumberSequence[];
  updateSequence: (
    id: string,
    patch: Pick<NumberSequence, "prefix" | "nextNumber" | "padding">,
    actor?: string
  ) => void;
  resetSequences: () => void;
};

export const useSequenceStore = create<SequenceState>()(
  persist(
    (set, get) => ({
      sequences: seedSequences,

      updateSequence: (sequenceId, patch, actor = "Administrator") => {
        set((state) => ({
          sequences: state.sequences.map((sequence) =>
            sequence.id === sequenceId
              ? { ...sequence, ...patch }
              : sequence
          ),
        }));
        const sequence = get().sequences.find((item) => item.id === sequenceId);
        useAuditStore.getState().addAudit({
          action: "sequence.updated",
          entityType: "number_sequence",
          entityId: sequence?.key ?? sequenceId,
          actor,
          branch: "JKT-01",
          description: `Penomoran ${sequence?.label ?? sequenceId} diperbarui.`,
        });
      },

      resetSequences: () => set({ sequences: seedSequences }),
    }),
    { name: "muranet-sequences", skipHydration: true }
  )
);
