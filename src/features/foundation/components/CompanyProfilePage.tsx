"use client";

import { Building2Icon, SaveIcon, UploadIcon } from "lucide-react";
import Image from "next/image";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCompanyProfile } from "@/features/foundation/hooks/useCompanyProfile";

export function CompanyProfilePage() {
  const { form, set, handleLogo, save } = useCompanyProfile();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        title="Profil perusahaan"
        description="Data ini dipakai untuk invoice, notifikasi, dan laporan resmi."
      >
        <Button onPress={save}>
          <SaveIcon />
          Simpan
        </Button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="gap-0 py-0">
          <CardContent className="space-y-4 p-5">
            <div className="flex size-32 items-center justify-center overflow-hidden rounded-2xl border bg-white p-3">
              {form.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.logoUrl}
                  alt="Logo perusahaan"
                  className="size-full object-contain"
                />
              ) : (
                <Image
                  src="/assets/logo.png"
                  alt="Logo MuraNET"
                  width={446}
                  height={446}
                  className="size-full object-contain"
                />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Logo perusahaan</p>
              <p className="text-xs text-muted-foreground">
                PNG/JPG, maksimal 2 MB. Rasio persegi.
              </p>
              <label className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted">
                <UploadIcon className="size-4" />
                Upload logo
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => handleLogo(event.target.files?.[0])}
                />
              </label>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5 font-medium text-foreground">
                <Building2Icon className="size-3.5" />
                {form.legalName}
              </p>
              <p className="mt-1">NPWP {form.taxNumber}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="gap-0 py-0">
            <CardHeader className="border-b px-5 py-4">
              <CardTitle>Identitas perusahaan</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="company-name">Nama brand</FieldLabel>
                <Input
                  id="company-name"
                  value={form.name}
                  onChange={(event) => set("name", event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="company-legal">Nama legal</FieldLabel>
                <Input
                  id="company-legal"
                  value={form.legalName}
                  onChange={(event) => set("legalName", event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="company-email">Email</FieldLabel>
                <Input
                  id="company-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => set("email", event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="company-phone">Telepon</FieldLabel>
                <Input
                  id="company-phone"
                  value={form.phone}
                  onChange={(event) => set("phone", event.target.value)}
                />
              </Field>
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="company-address">Alamat</FieldLabel>
                <Textarea
                  id="company-address"
                  value={form.address}
                  onChange={(event) => set("address", event.target.value)}
                  rows={3}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="company-tax">NPWP</FieldLabel>
                <Input
                  id="company-tax"
                  value={form.taxNumber}
                  onChange={(event) => set("taxNumber", event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="company-prefix">Prefix invoice</FieldLabel>
                <Input
                  id="company-prefix"
                  value={form.invoicePrefix}
                  onChange={(event) =>
                    set("invoicePrefix", event.target.value.toUpperCase())
                  }
                />
              </Field>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b px-5 py-4">
              <CardTitle>Fee & regulasi</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="bhp-rate">BHP (%)</FieldLabel>
                <Input
                  id="bhp-rate"
                  type="number"
                  step="0.01"
                  value={form.bhpRate}
                  onChange={(event) => set("bhpRate", Number(event.target.value))}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="uso-rate">USO (%)</FieldLabel>
                <Input
                  id="uso-rate"
                  type="number"
                  step="0.01"
                  value={form.usoRate}
                  onChange={(event) => set("usoRate", Number(event.target.value))}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="isp-fee">Fee ISP (%)</FieldLabel>
                <Input
                  id="isp-fee"
                  type="number"
                  step="0.01"
                  value={form.ispFeeRate}
                  onChange={(event) =>
                    set("ispFeeRate", Number(event.target.value))
                  }
                />
              </Field>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
