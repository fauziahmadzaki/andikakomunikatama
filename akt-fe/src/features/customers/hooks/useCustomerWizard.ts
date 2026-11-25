"use client";

import { useEffect, useMemo, useState } from "react";
import { generateUUID } from "@/lib/uuid";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { useBranchStore } from "@/features/branches/store/branch-store";
import {
  fetchDistricts,
  fetchProvinces,
  fetchRegencies,
  fetchVillages,
  matchRegion,
  reverseGeocode,
  type Region,
} from "@/features/customers/data/region";
import { nextCustomerNumber } from "@/features/customers/data/seed";
import type {
  AddressType,
  ContactType,
  CustomerType,
  IdentityType,
  RegistrationType,
} from "@/features/customers/data/types";
import { useCustomerStore } from "@/features/customers/store/customer-store";
import type { RouterQueue } from "@/features/network/data/types";
import { useNetworkStore } from "@/features/network/store/network-store";
import { usePlanProfileStore } from "@/features/plan-profiles/store/plan-profile-store";
import type {
  ConnectionType,
  IncentiveMethod,
  ProvisionMethod,
} from "@/features/subscriptions/data/types";
import { useUsersStore } from "@/features/users/store/users-store";
import { apiClient } from "@/lib/api-client";

type SyncSourceOption = {
  id: string;
  username: string;
  label: string;
  targetIp: string;
};

type WizardForm = {
  registrationType: RegistrationType;
  customerNumber: string;
  fullName: string;
  customerType: CustomerType;
  branchId: string;
  phone: string;
  phoneAlt: string;
  email: string;
  notes: string;
  identityType: IdentityType;
  identityNumber: string;
  identityFileName: string;

  addressType: AddressType;
  provinceId: string;
  province: string;
  regencyId: string;
  city: string;
  districtId: string;
  district: string;
  villageId: string;
  village: string;
  postalCode: string;
  addressLine: string;
  latitude: string;
  longitude: string;

  routerId: string;
  provisionMethod: ProvisionMethod;
  connectionType: ConnectionType;
  planId: string;
  targetIp: string;
  syncSourceId: string;

  snOnu: string;
  onuSerial: string;
  onuBrand: string;
  odcId: string;
  odpId: string;
  odpPort: string;
  cableLength: string;
  connectorCount: string;
  materialNotes: string;

  registrationDate: string;
  dueDay: string;
  taxEnabled: boolean;
  incentiveMethod: IncentiveMethod;
  incentiveValue: string;
  salesEmployeeId: string;
};

const contactType: ContactType = "whatsapp";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("62")) {
    return `0${digits.slice(2)}`;
  }
  return digits;
}

function isValidPhone(value: string) {
  return /^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(value.replace(/\s/g, ""));
}

function isValidIpv4(value: string) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(value) &&
    value.split(".").every((part) => Number(part) >= 0 && Number(part) <= 255);
}

function planTypeFor(connectionType: ConnectionType) {
  if (connectionType === "pppoe") {
    return "pppoe" as const;
  }
  if (connectionType === "hotspot") {
    return "hotspot" as const;
  }
  return "other" as const;
}

function manualOption(list: Region[], id: string, name: string) {
  if (name && !id) {
    return [{ id: "__manual", name }];
  }
  return [];
}

export function useCustomerWizard() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const customers = useCustomerStore((state) => state.customers);
  const contacts = useCustomerStore((state) => state.contacts);
  const identities = useCustomerStore((state) => state.identities);
  const drafts = useCustomerStore((state) => state.drafts);
  const registerCustomer = useCustomerStore((state) => state.registerCustomer);
  const saveDraftToStore = useCustomerStore((state) => state.saveDraft);
  const deleteDraft = useCustomerStore((state) => state.deleteDraft);
  const branches = useBranchStore((state) => state.branches);
  const fetchBranches = useBranchStore((state) => state.fetchBranches);
  const employees = useUsersStore((state) => state.employees);
  const packages = usePlanProfileStore((state) => state.profiles);
  const fetchPlanProfiles = usePlanProfileStore(
    (state) => state.fetchPlanProfiles
  );
  const routers = useNetworkStore((state) => state.routers);
  const fetchRouters = useNetworkStore((state) => state.fetchRouters);
  const passiveDevices = useNetworkStore((state) => state.passiveDevices);

  const activeBranches = branches.filter((item) => item.isActive);
  const defaultBranchId = activeBranches[0]?.id ?? "";
  const defaultRouter = routers.find(
    (item) => item.branchId === defaultBranchId && item.status === "active"
  );
  const defaultSales =
    employees.find((employee) => employee.fullName === session?.name)?.id ??
    employees[0]?.id ??
    "";

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardForm>(() => ({
    registrationType: "new",
    customerNumber: nextCustomerNumber(customers),
    fullName: "",
    customerType: "residential",
    branchId: defaultBranchId,
    phone: "",
    phoneAlt: "",
    email: "",
    notes: "",
    identityType: "ktp",
    identityNumber: "",
    identityFileName: "",

    addressType: "home",
    provinceId: "",
    province: "",
    regencyId: "",
    city: "",
    districtId: "",
    district: "",
    villageId: "",
    village: "",
    postalCode: "",
    addressLine: "",
    latitude: "",
    longitude: "",

    routerId: defaultRouter?.id ?? "",
    provisionMethod: "new",
    connectionType: "pppoe",
    planId: defaultRouter
      ? packages.find(
          (item) =>
            item.isActive &&
            item.routerId === defaultRouter.id &&
            item.type === "pppoe"
        )?.id ?? ""
      : "",
    targetIp: "",
    syncSourceId: "",

    snOnu: "",
    onuSerial: "",
    onuBrand: "",
    odcId: "",
    odpId: "",
    odpPort: "",
    cableLength: "",
    connectorCount: "",
    materialNotes: "",

    registrationDate: today(),
    dueDay: "10",
    taxEnabled: true,
    incentiveMethod: "none",
    incentiveValue: "0",
    salesEmployeeId: defaultSales,
  }));
  const [error, setError] = useState<string | null>(null);
  const [overrideDuplicate, setOverrideDuplicate] = useState(false);
  const [draftId] = useState(() => generateUUID());
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queueState, setQueueState] = useState<{
    routerId: string;
    queues: RouterQueue[];
    message: string;
  }>({ routerId: "", queues: [], message: "" });
  const [syncState, setSyncState] = useState<{
    key: string;
    sources: SyncSourceOption[];
  }>({ key: "", sources: [] });

  const [provinces, setProvinces] = useState<Region[]>([]);
  const [regencies, setRegencies] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [villages, setVillages] = useState<Region[]>([]);

  useEffect(() => {
    fetchBranches();
    fetchRouters();
    fetchPlanProfiles();
  }, [fetchBranches, fetchPlanProfiles, fetchRouters]);

  useEffect(() => {
    if (!form.routerId) {
      return;
    }

    let active = true;
    const routerId = form.routerId;

    apiClient
      .get<{
        data: { connected: boolean; message: string; queues: RouterQueue[] };
      }>(`/routers/${routerId}/queues`)
      .then((response) => {
        if (!active) return;
        setQueueState({
          routerId,
          queues: response.data.data.queues ?? [],
          message: response.data.data.connected
            ? ""
            : response.data.data.message,
        });
      })
      .catch((err) => {
        if (!active) return;
        setQueueState({
          routerId,
          queues: [],
          message:
            err instanceof Error ? err.message : "Gagal mengambil queue router.",
        });
      });

    return () => {
      active = false;
    };
  }, [form.routerId]);

  useEffect(() => {
    if (
      !form.routerId ||
      (form.connectionType !== "pppoe" && form.connectionType !== "hotspot")
    ) {
      return;
    }

    let active = true;
    const routerId = form.routerId;
    const connectionType = form.connectionType;
    const key = `${routerId}:${connectionType}`;
    const path =
      connectionType === "pppoe"
        ? `/routers/${routerId}/pppoe-secrets`
        : `/routers/${routerId}/hotspot-users`;

    apiClient
      .get<{
        data: {
          connected: boolean;
          message: string;
          users: Array<{
            id: string;
            username: string;
            profile: string;
            comment?: string;
          }>;
        };
      }>(path)
      .then((response) => {
        if (!active) return;
        setSyncState({
          key,
          sources: (response.data.data.users ?? []).map((item) => ({
            id: item.id,
            username: item.username,
            label: `${item.username} — ${item.comment ?? item.profile ?? "tanpa komentar"}`,
            targetIp: "",
          })),
        });
      })
      .catch(() => {
        if (!active) return;
        setSyncState({ key, sources: [] });
      });

    return () => {
      active = false;
    };
  }, [form.connectionType, form.routerId]);

  useEffect(() => {
    let active = true;
    void fetchProvinces().then((list) => {
      if (active) {
        setProvinces(list);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!form.provinceId) {
      return;
    }
    let active = true;
    void fetchRegencies(form.provinceId).then((list) => {
      if (active) {
        setRegencies(list);
      }
    });
    return () => {
      active = false;
    };
  }, [form.provinceId]);

  useEffect(() => {
    if (!form.regencyId) {
      return;
    }
    let active = true;
    void fetchDistricts(form.regencyId).then((list) => {
      if (active) {
        setDistricts(list);
      }
    });
    return () => {
      active = false;
    };
  }, [form.regencyId]);

  useEffect(() => {
    if (!form.districtId) {
      return;
    }
    let active = true;
    void fetchVillages(form.districtId).then((list) => {
      if (active) {
        setVillages(list);
      }
    });
    return () => {
      active = false;
    };
  }, [form.districtId]);

  const branchRouters = useMemo(
    () =>
      routers.filter(
        (item) => item.branchId === form.branchId && item.status === "active"
      ),
    [form.branchId, routers]
  );
  const queues = useMemo(
    () => (queueState.routerId === form.routerId ? queueState.queues : []),
    [form.routerId, queueState]
  );
  const connectionPlanType = planTypeFor(form.connectionType);
  const planOptions = useMemo(
    () =>
      packages.filter(
        (item) =>
          item.isActive &&
          item.routerId === form.routerId &&
          item.type === connectionPlanType
      ),
    [connectionPlanType, form.routerId, packages]
  );
  const syncKey = `${form.routerId}:${form.connectionType}`;
  const syncSources = useMemo<SyncSourceOption[]>(() => {
    if (form.connectionType === "pppoe" || form.connectionType === "hotspot") {
      return syncState.key === syncKey ? syncState.sources : [];
    }

    return queues
      .filter((queue) => queue.kind === "simple")
      .map((queue) => ({
        id: queue.id,
        username: queue.name,
        label: `${queue.name} — ${queue.comment ?? "tanpa komentar"}`,
        targetIp: queue.target ?? "",
      }));
  }, [form.connectionType, queues, syncKey, syncState]);

  const plan = packages.find((item) => item.id === form.planId);
  const branch = branches.find((item) => item.id === form.branchId);
  const selectedRouter = routers.find((item) => item.id === form.routerId);
  const branchOdcs = passiveDevices.filter(
    (device) => device.branchId === form.branchId && device.type === "odc"
  );
  const selectedOdc = passiveDevices.find(
    (device) => device.id === form.odcId
  );
  const odcOdps = passiveDevices.filter(
    (device) =>
      device.type === "odp" && device.parentDeviceId === form.odcId
  );
  const selectedOdp = passiveDevices.find(
    (device) => device.id === form.odpId
  );
  const usedOdpPorts =
    selectedOdp?.usedPorts ??
    Array.from(
      { length: selectedOdp?.usedCapacity ?? 0 },
      (_, index) => index + 1
    );
  const availableOdpPorts = selectedOdp
    ? Array.from(
        { length: selectedOdp.capacity },
        (_, index) => index + 1
      ).filter((port) => !usedOdpPorts.includes(port))
    : [];
  const price = plan?.price ?? 0;
  const customerNumberTaken = customers.some(
    (customer) =>
      customer.customerNumber === form.customerNumber.trim() &&
      customer.customerNumber !== ""
  );

  function planPriceFor(planId: string) {
    return packages.find((item) => item.id === planId)?.price ?? 0;
  }

  function firstPlanId(routerId: string, connectionType: ConnectionType) {
    return (
      packages.find(
        (item) =>
          item.isActive &&
          item.routerId === routerId &&
          item.type === planTypeFor(connectionType)
      )?.id ?? ""
    );
  }

  const duplicates = useMemo(() => {
    const phone = normalizePhone(form.phone);
    const identity = form.identityNumber.replace(/\D/g, "");
    if (phone.length < 8 && identity.length < 8) {
      return [];
    }
    return customers.filter((customer) => {
      const customerPhone =
        contacts.find(
          (contact) =>
            contact.customerId === customer.id &&
            (contact.contactType === "phone" ||
              contact.contactType === "whatsapp")
        )?.value ?? "";
      const customerIdentity =
        identities.find((item) => item.customerId === customer.id)
          ?.identityNumber ?? "";
      const samePhone =
        phone.length >= 8 && normalizePhone(customerPhone) === phone;
      const sameIdentity =
        identity.length >= 8 &&
        customerIdentity.replace(/\D/g, "") === identity;
      return samePhone || sameIdentity;
    });
  }, [contacts, customers, form.identityNumber, form.phone, identities]);

  function set<K extends keyof WizardForm>(key: K, value: WizardForm[K]) {
    setForm((current) => ({ ...current, [key]: value }) as WizardForm);
    setError(null);
  }

  function selectProvince(id: string) {
    if (id === "__manual") {
      return;
    }
    const region = provinces.find((item) => item.id === id);
    setRegencies([]);
    setDistricts([]);
    setVillages([]);
    setForm((current) => ({
      ...current,
      provinceId: id,
      province: region?.name ?? "",
      regencyId: "",
      city: "",
      districtId: "",
      district: "",
      villageId: "",
      village: "",
    }));
    setError(null);
  }

  function selectCity(id: string) {
    if (id === "__manual") {
      return;
    }
    const region = regencies.find((item) => item.id === id);
    setDistricts([]);
    setVillages([]);
    setForm((current) => ({
      ...current,
      regencyId: id,
      city: region?.name ?? "",
      districtId: "",
      district: "",
      villageId: "",
      village: "",
    }));
    setError(null);
  }

  function selectDistrict(id: string) {
    if (id === "__manual") {
      return;
    }
    const region = districts.find((item) => item.id === id);
    setVillages([]);
    setForm((current) => ({
      ...current,
      districtId: id,
      district: region?.name ?? "",
      villageId: "",
      village: "",
    }));
    setError(null);
  }

  function selectVillage(id: string) {
    if (id === "__manual") {
      return;
    }
    const region = villages.find((item) => item.id === id);
    setForm((current) => ({
      ...current,
      villageId: id,
      village: region?.name ?? "",
    }));
    setError(null);
  }

  async function applyMapPoint(latitude: number, longitude: number) {
    setForm((current) => ({
      ...current,
      latitude: String(latitude),
      longitude: String(longitude),
    }));

    const result = await reverseGeocode(latitude, longitude);
    const provinceList = provinces.length > 0 ? provinces : await fetchProvinces();
    const province = matchRegion(
      provinceList,
      result.provinceCandidates ?? [result.province ?? ""]
    );
    const regencyList = province ? await fetchRegencies(province.id) : [];
    const city = matchRegion(
      regencyList,
      result.cityCandidates ?? [result.city ?? ""]
    );
    const districtList = city ? await fetchDistricts(city.id) : [];
    const district = matchRegion(
      districtList,
      result.districtCandidates ?? [result.district ?? "", result.city ?? ""]
    );
    const villageList = district ? await fetchVillages(district.id) : [];
    const village = matchRegion(
      villageList,
      result.villageCandidates ?? [result.village ?? "", result.district ?? ""]
    );

    if (provinceList.length > 0) {
      setProvinces(provinceList);
    }
    setRegencies(regencyList);
    setDistricts(districtList);
    setVillages(villageList);

    setForm((current) => ({
      ...current,
      latitude: String(latitude),
      longitude: String(longitude),
      provinceId: province?.id ?? current.provinceId,
      province: province?.name ?? result.province ?? current.province,
      regencyId: city?.id ?? "",
      city: city?.name ?? result.city ?? current.city,
      districtId: district?.id ?? "",
      district: district?.name ?? result.district ?? current.district,
      villageId: village?.id ?? "",
      village: village?.name ?? result.village ?? current.village,
      postalCode: result.postalCode ?? current.postalCode,
      addressLine: current.addressLine || result.addressLine || "",
    }));
    toast.success("Koordinat dan wilayah diisi dari peta.");
  }

  function selectBranch(branchId: string) {
    const nextRouter =
      routers.find(
        (item) => item.branchId === branchId && item.status === "active"
      ) ?? undefined;
    setForm((current) => ({
      ...current,
      branchId,
      routerId: nextRouter?.id ?? "",
      planId: nextRouter
        ? firstPlanId(nextRouter.id, current.connectionType)
        : "",
      syncSourceId: "",
      odcId: "",
      odpId: "",
      odpPort: "",
    }));
    setError(null);
  }

  function selectRouter(routerId: string) {
    setForm((current) => ({
      ...current,
      routerId,
      planId: firstPlanId(routerId, current.connectionType),
      syncSourceId: "",
      targetIp: "",
    }));
    setError(null);
  }

  function selectConnectionType(connectionType: ConnectionType) {
    setForm((current) => ({
      ...current,
      connectionType,
      planId: firstPlanId(current.routerId, connectionType),
      syncSourceId: "",
      targetIp: "",
    }));
    setError(null);
  }

  function selectProvisionMethod(provisionMethod: ProvisionMethod) {
    setForm((current) => ({
      ...current,
      provisionMethod,
      syncSourceId: "",
      targetIp: "",
    }));
    setError(null);
  }

  function selectSyncSource(sourceId: string) {
    const source = syncSources.find((item) => item.id === sourceId);
    setForm((current) => ({
      ...current,
      syncSourceId: sourceId,
      targetIp: source?.targetIp ?? current.targetIp,
    }));
    setError(null);
  }

  function selectOdc(odcId: string) {
    setForm((current) => ({
      ...current,
      odcId,
      odpId: "",
      odpPort: "",
    }));
    setError(null);
  }

  function selectOdp(odpId: string) {
    setForm((current) => ({
      ...current,
      odpId,
      odpPort: "",
    }));
    setError(null);
  }

  function validateStep(current: number) {
    if (current === 1) {
      if (!form.fullName.trim()) {
        return "Nama lengkap wajib diisi.";
      }
      if (!form.customerNumber.trim()) {
        return "ID pelanggan wajib diisi.";
      }
      if (!/^\d{12}$/.test(form.customerNumber.trim())) {
        return "ID pelanggan harus 12 digit (YYMMDDHHmmss).";
      }
      if (customerNumberTaken) {
        return "ID pelanggan sudah dipakai pelanggan lain.";
      }
      if (!form.branchId) {
        return "Cabang wajib dipilih.";
      }
      if (!isValidPhone(form.phone)) {
        return "Nomor HP 1 tidak valid. Gunakan format 08xx atau +62.";
      }
      if (form.phoneAlt && !isValidPhone(form.phoneAlt)) {
        return "Nomor HP 2 tidak valid.";
      }
      if (!form.identityNumber.trim()) {
        return "Nomor identitas wajib diisi.";
      }
      const identity = form.identityNumber.replace(/\D/g, "");
      if (form.identityType !== "passport" && identity.length < 8) {
        return "Nomor identitas minimal 8 digit.";
      }
    }
    if (current === 2) {
      if (!form.province.trim() || !form.city.trim()) {
        return "Provinsi dan kabupaten/kota wajib dipilih.";
      }
      if (!form.district.trim() || !form.village.trim()) {
        return "Kecamatan dan kelurahan wajib dipilih.";
      }
      if (!form.addressLine.trim()) {
        return "Alamat lengkap wajib diisi.";
      }
    }
    if (current === 3) {
      if (!form.routerId) {
        return "Router wajib dipilih.";
      }
      if (!form.planId) {
        return "Paket wajib dipilih sesuai jenis koneksi.";
      }
      if (form.provisionMethod === "sync" && !form.syncSourceId) {
        return "Pilih data yang akan disinkronkan.";
      }
      if (form.connectionType === "static") {
        if (!isValidIpv4(form.targetIp)) {
          return "IP address pelanggan untuk simple queue tidak valid.";
        }
      }
    }
    if (current === 5) {
      if (!form.registrationDate) {
        return "Tanggal registrasi wajib diisi.";
      }
      const dueDay = Number(form.dueDay);
      if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
        return "Tanggal jatuh tempo harus 1–31.";
      }
      if (
        form.incentiveMethod !== "none" &&
        (!Number.isFinite(Number(form.incentiveValue)) ||
          Number(form.incentiveValue) <= 0)
      ) {
        return "Nilai insentif sales wajib diisi.";
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
    setStep((current) => Math.min(6, current + 1));
  }

  function back() {
    setError(null);
    setStep((current) => Math.max(1, current - 1));
  }

  function goToStep(target: number) {
    setError(null);
    setStep(target);
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
    const data = draft.data as unknown as Partial<WizardForm>;
    setForm({
      ...form,
      ...data,
      dueDay: String(data.dueDay ?? form.dueDay),
    });
    setStep(draft.step);
    setDraftLoaded(true);
    toast.success("Draft dimuat.");
  }

  async function submit() {
    for (const currentStep of [1, 2, 3, 5]) {
      const message = validateStep(currentStep);
      if (message) {
        setError(message);
        setStep(currentStep);
        return;
      }
    }
    if (duplicates.length > 0 && !overrideDuplicate) {
      setError("Pelanggan dengan nomor HP atau identitas yang sama sudah ada.");
      return;
    }
    if (!plan || !branch || !selectedRouter) {
      setError("Paket, cabang, atau router tidak valid.");
      return;
    }

    const source = syncSources.find((item) => item.id === form.syncSourceId);
    const installation = {
      snOnu: form.snOnu || undefined,
      onuSerial: form.onuSerial || undefined,
      onuBrand: form.onuBrand || undefined,
      odc: selectedOdc?.code,
      odp: selectedOdp?.code,
      odpPort: form.odpPort || undefined,
      cableLengthM: form.cableLength ? Number(form.cableLength) : undefined,
      connectorCount: form.connectorCount
        ? Number(form.connectorCount)
        : undefined,
      materialNotes: form.materialNotes || undefined,
    };

    const payload = {
      customer: {
        customerNumber: form.customerNumber.trim() || undefined,
        branchId: form.branchId,
        salesEmployeeId: form.salesEmployeeId || undefined,
        fullName: form.fullName.trim(),
        customerType: form.customerType,
        registrationType: form.registrationType,
        status: "active" as const,
        registeredAt: form.registrationDate,
        notes: form.notes,
      },
      address: {
        addressType: form.addressType,
        addressLine: form.addressLine,
        village: form.village,
        villageId: form.villageId || undefined,
        district: form.district,
        districtId: form.districtId || undefined,
        city: form.city,
        regencyId: form.regencyId || undefined,
        province: form.province,
        provinceId: form.provinceId || undefined,
        postalCode: form.postalCode,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        isPrimary: true,
      },
      contacts: [
        {
          contactType,
          value: form.phone,
          isPrimary: true,
          isVerified: false,
        },
        ...(form.phoneAlt.trim()
          ? [
              {
                contactType: "phone" as const,
                value: form.phoneAlt.trim(),
                isPrimary: false,
                isVerified: false,
              },
            ]
          : []),
      ],
      identity: {
        identityType: form.identityType,
        identityNumber: form.identityNumber,
        fileName: form.identityFileName || undefined,
      },
      account: {
        email: form.email,
        phone: form.phone,
        isActive: true,
      },
      subscription: {
        planId: plan.id,
        dueDay: Number(form.dueDay),
        startDate: form.registrationDate,
        prorateEnabled: false,
        taxEnabled: form.taxEnabled,
        incentiveMethod: form.incentiveMethod,
        incentiveValue:
          form.incentiveMethod === "none"
            ? 0
            : Number(form.incentiveValue) || 0,
      },
      service: {
        connectionType: form.connectionType,
        provisionMethod: form.provisionMethod,
        routerId: form.routerId,
        targetIp: form.targetIp || undefined,
        syncSourceId: form.syncSourceId || undefined,
        username:
          form.provisionMethod === "sync" && source
            ? source.username
            : undefined,
        installation,
      },
      overrideDuplicate,
    };

    setIsSubmitting(true);

    try {
      const result = await registerCustomer(payload);
      const sync = result.routerSync;

      deleteDraft(draftId);

      if (sync && !sync.success) {
        toast.warning(
          `Pelanggan tersimpan, tetapi provisioning router gagal: ${sync.message}`,
          { duration: 8000 }
        );
      } else if (result.provisioning) {
        toast.success(
          `Pelanggan terdaftar. Username: ${result.provisioning.username} / Password: ${result.provisioning.password}`,
          { duration: 12000 }
        );
      } else {
        toast.success("Pelanggan berhasil didaftarkan.");
      }

      router.push(`/dashboard/pelanggan/${result.customerId}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal mendaftarkan pelanggan.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    customers,
    branches: activeBranches,
    employees,
    plans: planOptions,
    allPlans: packages,
    drafts,
    step,
    form,
    set,
    error,
    duplicates,
    customerNumberTaken,
    overrideDuplicate,
    setOverrideDuplicate,
    draftLoaded,
    plan,
    branch,
    router: selectedRouter,
    routerOptions: branchRouters,
    isSubmitting,
    branchOdcs,
    odcOdps,
    availableOdpPorts,
    selectedOdc,
    selectedOdp,
    syncSources,
    price,
    planPriceFor,
    provinces: [
      ...manualOption(provinces, form.provinceId, form.province),
      ...provinces,
    ],
    regencies: [
      ...manualOption(regencies, form.regencyId, form.city),
      ...regencies,
    ],
    districts: [
      ...manualOption(districts, form.districtId, form.district),
      ...districts,
    ],
    villages: [
      ...manualOption(villages, form.villageId, form.village),
      ...villages,
    ],
    selectProvince,
    selectCity,
    selectDistrict,
    selectVillage,
    applyMapPoint,
    selectBranch,
    selectRouter,
    selectConnectionType,
    selectProvisionMethod,
    selectSyncSource,
    selectOdc,
    selectOdp,
    next,
    back,
    goToStep,
    saveDraft,
    loadDraft,
    submit,
  };
}
