"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { CustomerSegment } from "@/features/customers/data/types";
import { useCustomerStore } from "@/features/customers/store/customer-store";

const emptyForm = { name: "", description: "", filterLabel: "" };

export function useCustomerSegments() {
  const segments = useCustomerStore((state) => state.segments);
  const addSegment = useCustomerStore((state) => state.addSegment);
  const deleteSegment = useCustomerStore((state) => state.deleteSegment);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [confirmSegment, setConfirmSegment] = useState<CustomerSegment | null>(
    null
  );

  function save() {
    if (!form.name.trim() || !form.filterLabel.trim()) {
      toast.error("Nama dan filter segmen wajib diisi.");
      return;
    }
    addSegment({ ...form, count: 0 });
    toast.success("Segmen dibuat.");
    setForm(emptyForm);
    setOpen(false);
  }

  function confirmDelete() {
    if (confirmSegment) {
      deleteSegment(confirmSegment.id);
      toast.success("Segmen dihapus.");
    }
    setConfirmSegment(null);
  }

  return {
    segments,
    open,
    setOpen,
    form,
    setForm,
    confirmSegment,
    setConfirmSegment,
    save,
    confirmDelete,
  };
}
