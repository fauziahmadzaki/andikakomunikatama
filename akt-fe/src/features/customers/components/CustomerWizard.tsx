"use client";

import type { ReactNode } from "react";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SaveIcon,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { SelectField } from "@/components/shared/SelectField";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  AddressType,
  CustomerType,
  IdentityType,
  RegistrationType,
} from "@/features/customers/data/types";
import { useCustomerWizard } from "@/features/customers/hooks/useCustomerWizard";
import type {
  ConnectionType,
  IncentiveMethod,
  ProvisionMethod,
} from "@/features/subscriptions/data/types";
import { formatRupiah } from "@/lib/format";
import { CustomerWizardStepper } from "./CustomerWizardStepper";
import { LocationPicker } from "./LocationPicker";

const registrationTypeLabel: Record<RegistrationType, string> = {
  new: "Baru",
  existing: "Lama",
  survey: "Survey",
};

const customerTypeLabel: Record<CustomerType, string> = {
  residential: "Residensial",
  business: "Bisnis",
};

const identityTypeLabel: Record<IdentityType, string> = {
  ktp: "KTP",
  sim: "SIM",
  ktm: "KTM",
  npwp: "NPWP",
  passport: "Passport",
};

const addressTypeLabel: Record<AddressType, string> = {
  home: "Rumah",
  office: "Kantor",
  installation: "Instalasi",
};

const connectionTypeLabel: Record<ConnectionType, string> = {
  static: "Static",
  dhcp: "DHCP",
  pppoe: "PPPoE",
  hotspot: "Hotspot",
};

const provisionMethodLabel: Record<ProvisionMethod, string> = {
  new: "Baru",
  sync: "Sinkronisasi",
};

const incentiveMethodLabel: Record<IncentiveMethod, string> = {
  none: "Tanpa insentif",
  fixed: "Nominal tetap",
  percentage: "Persentase",
};

function SummaryItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium break-words">{value || "-"}</dd>
    </div>
  );
}

function SummaryCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{title}</p>
        <Button type="button" variant="ghost" size="xs" onPress={onEdit}>
          Ubah
        </Button>
      </div>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">{children}</dl>
    </div>
  );
}

export function CustomerWizard() {
  const {
    branches,
    employees,
    plans,
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
    router,
    routerOptions,
    parentQueues,
    selectedParentQueue,
    branchOdcs,
    odcOdps,
    availableOdpPorts,
    selectedOdc,
    selectedOdp,
    syncSources,
    price,
    provinces,
    regencies,
    districts,
    villages,
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
  } = useCustomerWizard();

  const provinceValue =
    form.provinceId || (form.province ? "__manual" : "");
  const cityValue = form.regencyId || (form.city ? "__manual" : "");
  const districtValue =
    form.districtId || (form.district ? "__manual" : "");
  const villageValue = form.villageId || (form.village ? "__manual" : "");

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Pendaftaran pelanggan"
        description="Lengkapi data bertahap. Draft bisa disimpan kapan saja."
      >
        <Button variant="outline" onPress={saveDraft}>
          <SaveIcon />
          Simpan draft
        </Button>
      </PageHeader>

      {drafts.length > 0 && !draftLoaded ? (
        <Card className="gap-0 border-primary/20 bg-primary/5 py-0">
          <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Ada draft pendaftaran tersimpan</p>
              <p className="text-xs text-muted-foreground">
                {drafts[0].data.fullName ?? "Tanpa nama"} · langkah{" "}
                {drafts[0].step}
              </p>
            </div>
            <Button variant="outline" size="sm" onPress={loadDraft}>
              Lanjutkan draft
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="gap-0 py-0">
        <CardContent className="space-y-6 p-5">
          <CustomerWizardStepper step={step} />

          {step === 1 ? (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  Data pelanggan
                </h2>
                <p className="text-sm text-muted-foreground">
                  Identitas utama dan kontak pelanggan.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Jenis pelanggan</p>
                  <SelectField
                    value={form.registrationType}
                    onValueChange={(value) =>
                      set("registrationType", value as RegistrationType)
                    }
                    ariaLabel="Jenis pelanggan"
                    options={[
                      { value: "new", label: "Baru" },
                      { value: "existing", label: "Lama" },
                      { value: "survey", label: "Survey" },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Tipe pelanggan</p>
                  <SelectField
                    value={form.customerType}
                    onValueChange={(value) =>
                      set("customerType", value as CustomerType)
                    }
                    ariaLabel="Tipe pelanggan"
                    options={[
                      { value: "residential", label: "Residensial" },
                      { value: "business", label: "Bisnis" },
                    ]}
                  />
                </div>

                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="customer-number">
                    ID pelanggan
                  </FieldLabel>
                  <Input
                    id="customer-number"
                    value={form.customerNumber}
                    placeholder="YYMMDDHHmmss"
                    className="font-mono"
                    onChange={(event) =>
                      set("customerNumber", event.target.value)
                    }
                  />
                  <FieldDescription>
                    Format YYMMDDHHmmss, otomatis dibuat dan masih bisa diubah.
                    {customerNumberTaken
                      ? " ID ini sudah dipakai pelanggan lain."
                      : ""}
                  </FieldDescription>
                </Field>

                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="full-name">Nama lengkap</FieldLabel>
                  <Input
                    id="full-name"
                    value={form.fullName}
                    placeholder="Nama sesuai identitas"
                    onChange={(event) => set("fullName", event.target.value)}
                  />
                </Field>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Cabang</p>
                  <SelectField
                    value={form.branchId}
                    onValueChange={selectBranch}
                    ariaLabel="Cabang pelanggan"
                    options={branches.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                  />
                </div>

                <Field>
                  <FieldLabel htmlFor="phone">Nomor HP 1</FieldLabel>
                  <Input
                    id="phone"
                    value={form.phone}
                    placeholder="0812xxxxxxx"
                    onChange={(event) => set("phone", event.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="phone-alt">
                    Nomor HP 2 (opsional)
                  </FieldLabel>
                  <Input
                    id="phone-alt"
                    value={form.phoneAlt}
                    placeholder="0813xxxxxxx"
                    onChange={(event) => set("phoneAlt", event.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email (opsional)</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    placeholder="nama@email.com"
                    onChange={(event) => set("email", event.target.value)}
                  />
                </Field>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Jenis identitas</p>
                  <SelectField
                    value={form.identityType}
                    onValueChange={(value) =>
                      set("identityType", value as IdentityType)
                    }
                    ariaLabel="Jenis identitas"
                    options={[
                      { value: "ktp", label: "KTP" },
                      { value: "sim", label: "SIM" },
                      { value: "ktm", label: "KTM" },
                    ]}
                  />
                </div>

                <Field>
                  <FieldLabel htmlFor="identity-number">
                    Nomor identitas
                  </FieldLabel>
                  <Input
                    id="identity-number"
                    value={form.identityNumber}
                    placeholder={
                      form.identityType === "ktp"
                        ? "16 digit NIK"
                        : form.identityType === "sim"
                          ? "Nomor SIM"
                          : "Nomor KTM"
                    }
                    onChange={(event) =>
                      set("identityNumber", event.target.value)
                    }
                  />
                </Field>

                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="identity-file">
                    Upload file identitas (opsional)
                  </FieldLabel>
                  <Input
                    id="identity-file"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(event) =>
                      set(
                        "identityFileName",
                        event.target.files?.[0]?.name ?? ""
                      )
                    }
                  />
                  <FieldDescription>
                    Simulasi saja. File tidak disimpan, hanya nama file yang
                    dicatat.
                    {form.identityFileName
                      ? ` Dipilih: ${form.identityFileName}`
                      : ""}
                  </FieldDescription>
                </Field>

                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="notes">Catatan</FieldLabel>
                  <Textarea
                    id="notes"
                    rows={2}
                    value={form.notes}
                    placeholder="Catatan internal (opsional)"
                    onChange={(event) => set("notes", event.target.value)}
                  />
                </Field>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">Alamat</h2>
                <p className="text-sm text-muted-foreground">
                  Pilih wilayah berurutan atau isi otomatis lewat peta.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Tipe alamat</p>
                  <SelectField
                    value={form.addressType}
                    onValueChange={(value) =>
                      set("addressType", value as AddressType)
                    }
                    ariaLabel="Tipe alamat"
                    options={[
                      { value: "home", label: "Rumah" },
                      { value: "office", label: "Kantor" },
                      { value: "installation", label: "Instalasi" },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Provinsi</p>
                  <SelectField
                    value={provinceValue}
                    onValueChange={selectProvince}
                    ariaLabel="Provinsi"
                    placeholder="Pilih provinsi"
                    options={provinces.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Kabupaten/Kota</p>
                  <SelectField
                    value={cityValue}
                    onValueChange={selectCity}
                    ariaLabel="Kabupaten atau kota"
                    disabled={!form.provinceId}
                    placeholder="Pilih kabupaten/kota"
                    options={regencies.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Kecamatan</p>
                  <SelectField
                    value={districtValue}
                    onValueChange={selectDistrict}
                    ariaLabel="Kecamatan"
                    disabled={!form.regencyId}
                    placeholder="Pilih kecamatan"
                    options={districts.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Kelurahan/Desa</p>
                  <SelectField
                    value={villageValue}
                    onValueChange={selectVillage}
                    ariaLabel="Kelurahan atau desa"
                    disabled={!form.districtId}
                    placeholder="Pilih kelurahan/desa"
                    options={villages.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                  />
                </div>

                <Field>
                  <FieldLabel htmlFor="postal-code">Kode pos</FieldLabel>
                  <Input
                    id="postal-code"
                    value={form.postalCode}
                    onChange={(event) => set("postalCode", event.target.value)}
                  />
                </Field>

                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="address">Alamat lengkap</FieldLabel>
                  <Textarea
                    id="address"
                    rows={3}
                    value={form.addressLine}
                    placeholder="Jalan, nomor rumah, RT/RW"
                    onChange={(event) => set("addressLine", event.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="latitude">Latitude</FieldLabel>
                  <Input
                    id="latitude"
                    value={form.latitude}
                    placeholder="-6.200000"
                    onChange={(event) => set("latitude", event.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="longitude">Longitude</FieldLabel>
                  <Input
                    id="longitude"
                    value={form.longitude}
                    placeholder="106.816666"
                    onChange={(event) => set("longitude", event.target.value)}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <LocationPicker
                    latitude={form.latitude}
                    longitude={form.longitude}
                    onPick={applyMapPoint}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  Koneksi
                </h2>
                <p className="text-sm text-muted-foreground">
                  Router, metode provisioning, dan paket layanan.
                </p>
              </div>

              {routerOptions.length === 0 ? (
                <p
                  role="alert"
                  className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-400"
                >
                  Cabang ini belum memiliki router aktif. Tambahkan router dulu
                  di menu Jaringan.
                </p>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Router</p>
                  <SelectField
                    value={form.routerId}
                    onValueChange={selectRouter}
                    ariaLabel="Router pelanggan"
                    placeholder="Pilih router"
                    options={routerOptions.map((item) => ({
                      value: item.id,
                      label: `${item.name} — ${item.host}`,
                    }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Metode</p>
                  <SelectField
                    value={form.provisionMethod}
                    onValueChange={(value) =>
                      selectProvisionMethod(value as ProvisionMethod)
                    }
                    ariaLabel="Metode provisioning"
                    options={[
                      { value: "new", label: "Baru" },
                      { value: "sync", label: "Sinkronisasi" },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Jenis koneksi</p>
                  <SelectField
                    value={form.connectionType}
                    onValueChange={(value) =>
                      selectConnectionType(value as ConnectionType)
                    }
                    ariaLabel="Jenis koneksi"
                    options={[
                      { value: "static", label: "Static" },
                      { value: "dhcp", label: "DHCP" },
                      { value: "pppoe", label: "PPPoE" },
                      { value: "hotspot", label: "Hotspot" },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Paket</p>
                  <SelectField
                    value={form.planId}
                    onValueChange={(value) => set("planId", value)}
                    ariaLabel="Paket pelanggan"
                    placeholder={
                      plans.length === 0
                        ? "Belum ada paket yang cocok"
                        : "Pilih paket"
                    }
                    options={plans.map((item) => ({
                      value: item.id,
                      label: `${item.name} — ${formatRupiah(item.price)}`,
                    }))}
                  />
                </div>

                {form.provisionMethod === "sync" ? (
                  <div className="space-y-1.5 sm:col-span-2">
                    <p className="text-sm font-medium">
                      Data yang disinkronkan
                    </p>
                    <SelectField
                      value={form.syncSourceId}
                      onValueChange={selectSyncSource}
                      ariaLabel="Data sinkronisasi"
                      placeholder={
                        syncSources.length === 0
                          ? form.connectionType === "pppoe" ||
                            form.connectionType === "hotspot"
                            ? "Belum ada user existing"
                            : "Belum ada queue existing"
                          : "Pilih data existing"
                      }
                      options={syncSources.map((item) => ({
                        value: item.id,
                        label: item.label,
                      }))}
                    />
                    <FieldDescription>
                      Data diambil dari simulasi router, bukan integrasi
                      MikroTik langsung.
                    </FieldDescription>
                  </div>
                ) : null}

                <div className="space-y-1.5 sm:col-span-2">
                  <p className="text-sm font-medium">Parent queue</p>
                  <SelectField
                    value={form.parentQueueId}
                    onValueChange={(value) => set("parentQueueId", value)}
                    ariaLabel="Parent queue"
                    placeholder={
                      parentQueues.length === 0
                        ? "Belum ada parent queue di router ini"
                        : "Pilih parent queue"
                    }
                    options={parentQueues.map((queue) => ({
                      value: queue.id,
                      label: queue.maxLimit
                        ? `${queue.name} — ${queue.maxLimit}`
                        : queue.name,
                    }))}
                  />
                </div>

                {form.connectionType === "static" ? (
                  <>
                    <Field>
                      <FieldLabel htmlFor="queue-name">
                        Nama pelanggan (comment queue)
                      </FieldLabel>
                      <Input
                        id="queue-name"
                        value={form.queueName}
                        onChange={(event) =>
                          set("queueName", event.target.value)
                        }
                      />
                      <FieldDescription>
                        Dipakai sebagai komentar simple queue di router.
                      </FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="target-ip">
                        IP address pelanggan
                      </FieldLabel>
                      <Input
                        id="target-ip"
                        value={form.targetIp}
                        placeholder="10.10.40.10"
                        onChange={(event) =>
                          set("targetIp", event.target.value)
                        }
                      />
                      <FieldDescription>
                        Target IP untuk simple queue pelanggan.
                      </FieldDescription>
                    </Field>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  Infra & material
                </h2>
                <p className="text-sm text-muted-foreground">
                  Semua opsional, bisa dilengkapi teknisi lapangan.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="sn-onu">SN ONU</FieldLabel>
                  <Input
                    id="sn-onu"
                    value={form.snOnu}
                    onChange={(event) => set("snOnu", event.target.value)}
                  />
                </Field>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Merek ONU</p>
                  <SelectField
                    value={form.onuBrand}
                    onValueChange={(value) => set("onuBrand", value)}
                    ariaLabel="Merek ONU"
                    placeholder="Pilih merek"
                    options={[
                      { value: "ZTE", label: "ZTE" },
                      { value: "Huawei", label: "Huawei" },
                      { value: "HSGQ", label: "HSGQ" },
                      { value: "FiberHome", label: "FiberHome" },
                      { value: "Lainnya", label: "Lainnya" },
                    ]}
                  />
                </div>

                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="onu-serial">Serial number ONU</FieldLabel>
                  <Input
                    id="onu-serial"
                    value={form.onuSerial}
                    onChange={(event) => set("onuSerial", event.target.value)}
                  />
                </Field>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">ODC</p>
                  <SelectField
                    value={form.odcId}
                    onValueChange={selectOdc}
                    ariaLabel="ODC"
                    placeholder={
                      branchOdcs.length === 0
                        ? "Belum ada ODC di cabang ini"
                        : "Pilih ODC"
                    }
                    disabled={branchOdcs.length === 0}
                    options={branchOdcs.map((device) => ({
                      value: device.id,
                      label: `${device.code} — ${device.name}`,
                    }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">ODP</p>
                  <SelectField
                    value={form.odpId}
                    onValueChange={selectOdp}
                    ariaLabel="ODP"
                    placeholder={
                      !form.odcId
                        ? "Pilih ODC terlebih dahulu"
                        : odcOdps.length === 0
                          ? "Belum ada ODP di ODC ini"
                          : "Pilih ODP"
                    }
                    disabled={!form.odcId || odcOdps.length === 0}
                    options={odcOdps.map((device) => {
                      const usedPorts =
                        device.usedPorts ??
                        Array.from(
                          { length: device.usedCapacity },
                          (_, index) => index + 1
                        );
                      const emptyPorts = Math.max(
                        0,
                        device.capacity - usedPorts.length
                      );
                      return {
                        value: device.id,
                        label: `${device.code} — ${device.name} · ${emptyPorts} port kosong`,
                      };
                    })}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Port ODP</p>
                  <SelectField
                    value={form.odpPort}
                    onValueChange={(value) => set("odpPort", value)}
                    ariaLabel="Port ODP"
                    placeholder={
                      !form.odpId
                        ? "Pilih ODP terlebih dahulu"
                        : availableOdpPorts.length === 0
                          ? "Tidak ada port kosong"
                          : "Pilih port kosong"
                    }
                    disabled={!form.odpId || availableOdpPorts.length === 0}
                    options={availableOdpPorts.map((port) => ({
                      value: String(port),
                      label: `Port ${port}`,
                    }))}
                  />
                </div>

                <Field>
                  <FieldLabel htmlFor="cable-length">
                    Panjang kabel (meter)
                  </FieldLabel>
                  <Input
                    id="cable-length"
                    type="number"
                    min={0}
                    value={form.cableLength}
                    onChange={(event) => set("cableLength", event.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="connector-count">
                    Jumlah connector
                  </FieldLabel>
                  <Input
                    id="connector-count"
                    type="number"
                    min={0}
                    value={form.connectorCount}
                    onChange={(event) =>
                      set("connectorCount", event.target.value)
                    }
                  />
                </Field>

                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="material-notes">
                    Catatan material lain
                  </FieldLabel>
                  <Textarea
                    id="material-notes"
                    rows={2}
                    value={form.materialNotes}
                    placeholder="Patchcord, SFP, klem, dan lainnya"
                    onChange={(event) =>
                      set("materialNotes", event.target.value)
                    }
                  />
                </Field>
              </div>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  Pengaturan layanan
                </h2>
                <p className="text-sm text-muted-foreground">
                  Tanggal registrasi, penagihan, dan insentif sales.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="registration-date">
                    Tanggal registrasi
                  </FieldLabel>
                  <Input
                    id="registration-date"
                    type="date"
                    value={form.registrationDate}
                    onChange={(event) =>
                      set("registrationDate", event.target.value)
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="due-day">Jatuh tempo</FieldLabel>
                  <Input
                    id="due-day"
                    type="number"
                    min={1}
                    max={31}
                    value={form.dueDay}
                    onChange={(event) => set("dueDay", event.target.value)}
                  />
                  <FieldDescription>
                    Tanggal jatuh tempo setiap bulan (1–31).
                  </FieldDescription>
                </Field>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Metode insentif</p>
                  <SelectField
                    value={form.incentiveMethod}
                    onValueChange={(value) =>
                      set("incentiveMethod", value as IncentiveMethod)
                    }
                    ariaLabel="Metode insentif"
                    options={[
                      { value: "none", label: "Tanpa insentif" },
                      { value: "fixed", label: "Nominal tetap" },
                      { value: "percentage", label: "Persentase" },
                    ]}
                  />
                </div>

                {form.incentiveMethod !== "none" ? (
                  <Field>
                    <FieldLabel htmlFor="incentive-value">
                      {form.incentiveMethod === "fixed"
                        ? "Nominal insentif"
                        : "Persentase insentif (%)"}
                    </FieldLabel>
                    <Input
                      id="incentive-value"
                      type="number"
                      min={0}
                      value={form.incentiveValue}
                      onChange={(event) =>
                        set("incentiveValue", event.target.value)
                      }
                    />
                  </Field>
                ) : null}

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Sales</p>
                  <SelectField
                    value={form.salesEmployeeId}
                    onValueChange={(value) => set("salesEmployeeId", value)}
                    ariaLabel="Sales pelanggan"
                    options={[
                      { value: "", label: "Tanpa sales" },
                      ...employees.map((employee) => ({
                        value: employee.id,
                        label: `${employee.fullName} · ${employee.position}`,
                      })),
                    ]}
                  />
                </div>

                <label className="flex items-end gap-2 pb-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.taxEnabled}
                    onChange={(event) =>
                      set("taxEnabled", event.target.checked)
                    }
                    className="size-4 rounded border-input accent-primary"
                  />
                  Kena PPN
                </label>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Paket</span>
                  <span className="font-medium">{plan?.name ?? "-"}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Biaya bulanan</span>
                  <span className="font-semibold">{formatRupiah(price)}</span>
                </div>
              </div>
            </div>
          ) : null}

          {step === 6 ? (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  Konfirmasi data
                </h2>
                <p className="text-sm text-muted-foreground">
                  Periksa kembali seluruh data sebelum menyimpan.
                </p>
              </div>

              <SummaryCard title="Data pelanggan" onEdit={() => goToStep(1)}>
                <SummaryItem
                  label="Jenis pelanggan"
                  value={registrationTypeLabel[form.registrationType]}
                />
                <SummaryItem
                  label="Tipe pelanggan"
                  value={customerTypeLabel[form.customerType]}
                />
                <SummaryItem label="ID pelanggan" value={form.customerNumber} />
                <SummaryItem label="Nama" value={form.fullName} />
                <SummaryItem label="Cabang" value={branch?.name} />
                <SummaryItem label="HP 1" value={form.phone} />
                <SummaryItem label="HP 2" value={form.phoneAlt} />
                <SummaryItem label="Email" value={form.email} />
                <SummaryItem
                  label="Identitas"
                  value={`${identityTypeLabel[form.identityType]} · ${
                    form.identityNumber
                  }`}
                />
                <SummaryItem
                  label="File identitas"
                  value={form.identityFileName}
                />
              </SummaryCard>

              <SummaryCard title="Alamat" onEdit={() => goToStep(2)}>
                <SummaryItem
                  label="Tipe alamat"
                  value={addressTypeLabel[form.addressType]}
                />
                <SummaryItem label="Provinsi" value={form.province} />
                <SummaryItem label="Kabupaten/Kota" value={form.city} />
                <SummaryItem label="Kecamatan" value={form.district} />
                <SummaryItem label="Kelurahan/Desa" value={form.village} />
                <SummaryItem label="Kode pos" value={form.postalCode} />
                <SummaryItem label="Alamat" value={form.addressLine} />
                <SummaryItem
                  label="Koordinat"
                  value={
                    form.latitude && form.longitude
                      ? `${form.latitude}, ${form.longitude}`
                      : ""
                  }
                />
              </SummaryCard>

              <SummaryCard title="Koneksi" onEdit={() => goToStep(3)}>
                <SummaryItem label="Router" value={router?.name} />
                <SummaryItem
                  label="Metode"
                  value={provisionMethodLabel[form.provisionMethod]}
                />
                <SummaryItem
                  label="Jenis koneksi"
                  value={connectionTypeLabel[form.connectionType]}
                />
                <SummaryItem label="Paket" value={plan?.name} />
                <SummaryItem
                  label="Parent queue"
                  value={selectedParentQueue?.name}
                />
                <SummaryItem
                  label="Data sinkronisasi"
                  value={
                    form.provisionMethod === "sync"
                      ? syncSources.find(
                          (item) => item.id === form.syncSourceId
                        )?.label
                      : ""
                  }
                />
                {form.connectionType === "static" ? (
                  <>
                    <SummaryItem
                      label="Comment queue"
                      value={form.queueName}
                    />
                    <SummaryItem
                      label="Target IP"
                      value={form.targetIp}
                    />
                  </>
                ) : null}
              </SummaryCard>

              <SummaryCard title="Infra & material" onEdit={() => goToStep(4)}>
                <SummaryItem label="SN ONU" value={form.snOnu} />
                <SummaryItem label="Merek ONU" value={form.onuBrand} />
                <SummaryItem label="Serial ONU" value={form.onuSerial} />
                <SummaryItem
                  label="ODC"
                  value={
                    selectedOdc
                      ? `${selectedOdc.code} — ${selectedOdc.name}`
                      : ""
                  }
                />
                <SummaryItem
                  label="ODP"
                  value={
                    selectedOdp
                      ? `${selectedOdp.code} — ${selectedOdp.name}`
                      : ""
                  }
                />
                <SummaryItem
                  label="Port ODP"
                  value={form.odpPort ? `Port ${form.odpPort}` : ""}
                />
                <SummaryItem
                  label="Panjang kabel"
                  value={
                    form.cableLength ? `${form.cableLength} meter` : ""
                  }
                />
                <SummaryItem
                  label="Jumlah connector"
                  value={form.connectorCount}
                />
                <SummaryItem
                  label="Catatan material"
                  value={form.materialNotes}
                />
              </SummaryCard>

              <SummaryCard
                title="Pengaturan layanan"
                onEdit={() => goToStep(5)}
              >
                <SummaryItem
                  label="Tanggal registrasi"
                  value={form.registrationDate}
                />
                <SummaryItem
                  label="Jatuh tempo"
                  value={`Tanggal ${form.dueDay}`}
                />
                <SummaryItem
                  label="PPN"
                  value={form.taxEnabled ? "Ya" : "Tidak"}
                />
                <SummaryItem
                  label="Metode insentif"
                  value={incentiveMethodLabel[form.incentiveMethod]}
                />
                <SummaryItem
                  label="Nilai insentif"
                  value={
                    form.incentiveMethod === "none"
                      ? ""
                      : form.incentiveMethod === "percentage"
                        ? `${form.incentiveValue}%`
                        : formatRupiah(Number(form.incentiveValue) || 0)
                  }
                />
                <SummaryItem
                  label="Sales"
                  value={
                    employees.find(
                      (item) => item.id === form.salesEmployeeId
                    )?.fullName
                  }
                />
                <SummaryItem
                  label="Biaya bulanan"
                  value={formatRupiah(price)}
                />
              </SummaryCard>

              {duplicates.length > 0 ? (
                <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium">
                        Kemungkinan duplikat ditemukan
                      </p>
                      <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                        {duplicates.map((customer) => (
                          <li key={customer.id}>
                            {customer.fullName} · {customer.customerNumber}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={overrideDuplicate}
                      onChange={(event) =>
                        setOverrideDuplicate(event.target.checked)
                      }
                      className="size-4 rounded border-input accent-primary"
                    />
                    Saya sudah memeriksa dan ingin tetap melanjutkan
                  </label>
                </div>
              ) : (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
                  Tidak ada duplikat nomor HP atau identitas yang terdeteksi.
                </div>
              )}
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-between border-t pt-4">
            <Button variant="outline" onPress={back} isDisabled={step === 1}>
              <ArrowLeftIcon />
              Kembali
            </Button>
            {step < 6 ? (
              <Button onPress={next}>
                Lanjut
                <ArrowRightIcon />
              </Button>
            ) : (
              <Button onPress={submit}>
                <SaveIcon />
                Simpan pelanggan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
