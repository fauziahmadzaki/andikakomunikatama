"use client";

import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SaveIcon,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { SelectField } from "@/components/shared/SelectField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerWizard } from "@/features/customers/hooks/useCustomerWizard";
import { CustomerWizardStepper } from "./CustomerWizardStepper";

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function CustomerWizard() {
  const {
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
  } = useCustomerWizard();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
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
                {drafts[0].data.fullName ?? "Tanpa nama"} · langkah {drafts[0].step}
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="full-name">Nama lengkap</FieldLabel>
                <Input
                  id="full-name"
                  value={form.fullName}
                  placeholder="Nama sesuai KTP"
                  onChange={(event) => set("fullName", event.target.value)}
                />
              </Field>
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Tipe pelanggan</p>
                <SelectField
                  value={form.customerType}
                  onValueChange={(value) =>
                    set("customerType", value as "residential" | "business")
                  }
                  ariaLabel="Tipe pelanggan"
                  options={[
                    { value: "residential", label: "Residensial" },
                    { value: "business", label: "Bisnis" },
                  ]}
                />
              </div>
              <Field>
                <FieldLabel htmlFor="nik">
                  {form.customerType === "residential" ? "NIK" : "NPWP"}
                </FieldLabel>
                <Input
                  id="nik"
                  value={form.nik}
                  placeholder={
                    form.customerType === "residential"
                      ? "16 digit NIK"
                      : "NPWP perusahaan"
                  }
                  onChange={(event) => set("nik", event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Nomor HP / WhatsApp</FieldLabel>
                <Input
                  id="phone"
                  value={form.phone}
                  placeholder="0812xxxxxxx"
                  onChange={(event) => set("phone", event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  placeholder="nama@email.com"
                  onChange={(event) => set("email", event.target.value)}
                />
              </Field>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="address">Alamat lengkap</FieldLabel>
                <Textarea
                  id="address"
                  rows={3}
                  value={form.address}
                  placeholder="Jalan, nomor rumah, RT/RW"
                  onChange={(event) => set("address", event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="village">Kelurahan</FieldLabel>
                <Input
                  id="village"
                  value={form.village}
                  onChange={(event) => set("village", event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="district">Kecamatan</FieldLabel>
                <Input
                  id="district"
                  value={form.district}
                  onChange={(event) => set("district", event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="city">Kota/Kabupaten</FieldLabel>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(event) => set("city", event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="province">Provinsi</FieldLabel>
                <Input
                  id="province"
                  value={form.province}
                  onChange={(event) => set("province", event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="postal-code">Kode pos</FieldLabel>
                <Input
                  id="postal-code"
                  value={form.postalCode}
                  onChange={(event) => set("postalCode", event.target.value)}
                />
              </Field>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Cabang</p>
                <SelectField
                  value={form.branchId}
                  onValueChange={(value) => set("branchId", value)}
                  ariaLabel="Cabang pelanggan"
                  options={branches
                    .filter((item) => item.isActive)
                    .map((item) => ({ value: item.id, label: item.name }))}
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Paket</p>
                <SelectField
                  value={form.planId}
                  onValueChange={(value) => set("planId", value)}
                  ariaLabel="Paket pelanggan"
                  options={planOptions.map((item) => ({
                    value: item.id,
                    label: `${item.name} — ${rupiah(item.price)}`,
                  }))}
                />
              </div>
              <Field>
                <FieldLabel htmlFor="due-day">Tanggal jatuh tempo</FieldLabel>
                <Input
                  id="due-day"
                  type="number"
                  min={1}
                  max={31}
                  value={form.dueDay}
                  onChange={(event) => set("dueDay", event.target.value)}
                />
              </Field>
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Sales</p>
                <SelectField
                  value={form.salesName}
                  onValueChange={(value) => set("salesName", value)}
                  ariaLabel="Sales pelanggan"
                  options={[
                    { value: "Rina Sales", label: "Rina Sales" },
                    { value: "Dewi Lestari", label: "Dewi Lestari" },
                    { value: "Bayu Pratama", label: "Bayu Pratama" },
                  ]}
                />
              </div>
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
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Identitas
                  </p>
                  <p className="mt-2 font-medium">{form.fullName}</p>
                  <p className="text-sm text-muted-foreground">{form.phone}</p>
                  <p className="text-sm text-muted-foreground">{form.email || "-"}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {form.nik}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Alamat
                  </p>
                  <p className="mt-2 text-sm">{form.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {form.village}, {form.district}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {form.city}, {form.province} {form.postalCode}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Langganan
                  </p>
                  <p className="mt-2 font-medium">{plan?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {branch?.name} · jatuh tempo tgl {form.dueDay}
                  </p>
                  <p className="text-sm font-medium">{rupiah(plan?.price ?? 0)}/bln</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Status
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusBadge tone="success">Aktif</StatusBadge>
                    <StatusBadge tone="primary">Prorate</StatusBadge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Sales: {form.salesName}
                  </p>
                </div>
              </div>

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
                            {customer.fullName} · {customer.customerNumber} ·{" "}
                            {customer.phone}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={overrideDuplicate}
                      onChange={(event) => setOverrideDuplicate(event.target.checked)}
                      className="size-4 rounded border-input accent-primary"
                    />
                    Saya sudah memeriksa dan ingin tetap melanjutkan
                  </label>
                </div>
              ) : (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
                  Tidak ada duplikat nomor HP atau NIK yang terdeteksi.
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
            {step < 4 ? (
              <Button onPress={next}>
                Lanjut
                <ArrowRightIcon />
              </Button>
            ) : (
              <Button onPress={submit}>Daftarkan pelanggan</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
