"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { planOptions } from "@/features/customers/data/seed";
import type { CustomerType } from "@/features/customers/data/types";
import { useCustomerStore } from "@/features/customers/store/customer-store";
import { useFoundationStore } from "@/features/foundation/store/foundation-store";

type WizardForm = {
  fullName: string;
  customerType: CustomerType;
  nik: string;
  phone: string;
  email: string;
  address: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  branchId: string;
  planId: string;
  dueDay: string;
  salesName: string;
  notes: string;
};

const emptyForm: WizardForm = {
  fullName: "",
  customerType: "residential",
  nik: "",
  phone: "",
  email: "",
  address: "",
  village: "",
  district: "",
  city: "",
  province: "",
  postalCode: "",
  branchId: "br-jkt",
  planId: "plan-20",
  dueDay: "10",
  salesName: "Rina Sales",
  notes: "",
};

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("62")) {
    return `0${digits.slice(2)}`;
  }
  return digits;
}

export function useCustomerWizard() {
  const router = useRouter();
  const customers = useCustomerStore((state) => state.customers);
  const drafts = useCustomerStore((state) => state.drafts);
  const addCustomer = useCustomerStore((state) => state.addCustomer);
  const saveDraftToStore = useCustomerStore((state) => state.saveDraft);
  const deleteDraft = useCustomerStore((state) => state.deleteDraft);
  const branches = useFoundationStore((state) => state.branches);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [overrideDuplicate, setOverrideDuplicate] = useState(false);
  const [draftId] = useState(() => crypto.randomUUID());
  const [draftLoaded, setDraftLoaded] = useState(false);

  const plan = planOptions.find((item) => item.id === form.planId);
  const branch = branches.find((item) => item.id === form.branchId);

  const duplicates = useMemo(() => {
    const phone = normalizePhone(form.phone);
    const nik = form.nik.replace(/\D/g, "");
    if (phone.length < 8 && nik.length < 8) {
      return [];
    }
    return customers.filter((customer) => {
      const samePhone =
        phone.length >= 8 && normalizePhone(customer.phone) === phone;
      const sameNik =
        nik.length >= 8 && customer.nik.replace(/\D/g, "") === nik;
      return samePhone || sameNik;
    });
  }, [customers, form.nik, form.phone]);

  function set<K extends keyof WizardForm>(key: K, value: WizardForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function validateStep(current: number) {
    if (current === 1) {
      if (!form.fullName.trim()) {
        return "Nama lengkap wajib diisi.";
      }
      if (!/^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(form.phone.replace(/\s/g, ""))) {
        return "Nomor HP tidak valid. Gunakan format 08xx atau +62.";
      }
      const identity = form.nik.replace(/\D/g, "");
      if (form.customerType === "residential" && identity.length !== 16) {
        return "NIK harus 16 digit.";
      }
      if (form.customerType === "business" && identity.length < 15) {
        return "NPWP minimal 15 digit.";
      }
    }
    if (current === 2) {
      if (!form.address.trim() || !form.city.trim() || !form.province.trim()) {
        return "Alamat, kota, dan provinsi wajib diisi.";
      }
    }
    if (current === 3) {
      if (!form.branchId || !form.planId) {
        return "Cabang dan paket wajib dipilih.";
      }
      const dueDay = Number(form.dueDay);
      if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
        return "Tanggal jatuh tempo harus 1–31.";
      }
    }
    return null;
  }

  function next() {
    const message = validateStep(step);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    setStep((current) => Math.min(4, current + 1));
  }

  function back() {
    setError(null);
    setStep((current) => Math.max(1, current - 1));
  }

  function saveDraft() {
    saveDraftToStore({
      id: draftId,
      step,
      updatedAt: new Date().toISOString(),
      data: {
        ...(form as unknown as Record<string, unknown>),
        dueDay: Number(form.dueDay),
      } as never,
    });
    toast.success("Draft pendaftaran disimpan.");
  }

  function loadDraft() {
    const draft = drafts[0];
    if (!draft) {
      return;
    }
    setForm({
      ...emptyForm,
      ...(draft.data as unknown as Partial<WizardForm>),
      dueDay: String(draft.data.dueDay ?? emptyForm.dueDay),
    });
    setStep(draft.step);
    setDraftLoaded(true);
    toast.success("Draft dimuat.");
  }

  function submit() {
    const message = validateStep(3);
    if (message) {
      setError(message);
      return;
    }
    if (duplicates.length > 0 && !overrideDuplicate) {
      setError("Pelanggan dengan nomor HP atau NIK yang sama sudah ada.");
      return;
    }

    const customer = addCustomer({
      fullName: form.fullName,
      customerType: form.customerType,
      status: "active",
      branchId: form.branchId,
      branchName: branch?.name ?? "Jakarta Pusat",
      planId: form.planId,
      planName: plan?.name ?? "Home 20 Mbps",
      monthlyFee: plan?.price ?? 200000,
      phone: form.phone,
      email: form.email,
      nik: form.nik,
      address: form.address,
      village: form.village,
      district: form.district,
      city: form.city,
      province: form.province,
      postalCode: form.postalCode,
      salesName: form.salesName,
      dueDay: Number(form.dueDay),
      subscriptionStatus: "active",
      outstanding: 0,
      notes: form.notes,
    });

    deleteDraft(draftId);
    toast.success("Pelanggan berhasil didaftarkan.");
    router.push(`/dashboard/pelanggan/${customer.id}`);
  }

  return {
    customers,
    branches,
    planOptions,
    drafts,
    step,
    form,
    set,
    error,
    duplicates,
    overrideDuplicate,
    setOverrideDuplicate,
    draftLoaded,
    plan,
    branch,
    next,
    back,
    saveDraft,
    loadDraft,
    submit,
  };
}
