"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { NumberSequence } from "@/features/foundation/data/types";
import { useFoundationStore } from "@/features/foundation/store/foundation-store";

export function useSequencesPage() {
  const sequences = useFoundationStore((state) => state.sequences);
  const updateSequence = useFoundationStore((state) => state.updateSequence);
  const [editing, setEditing] = useState<NumberSequence | null>(null);
  const [form, setForm] = useState({
    prefix: "",
    nextNumber: 1,
    padding: 6,
  });

  function openEdit(sequence: NumberSequence) {
    setEditing(sequence);
    setForm({
      prefix: sequence.prefix,
      nextNumber: sequence.nextNumber,
      padding: sequence.padding,
    });
  }

  function close() {
    setEditing(null);
  }

  function save() {
    if (!editing) {
      return;
    }
    updateSequence(editing.id, form);
    toast.success("Penomoran diperbarui.");
    setEditing(null);
  }

  return { sequences, editing, form, setForm, openEdit, close, save };
}
