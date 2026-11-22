"use client";

import {
  FileTextIcon,
  MapPinIcon,
  PhoneIcon,
  UserRoundIcon,
} from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  customerStatusLabel,
  customerStatusTone,
} from "@/features/customers/data/status";
import type {
  CustomerView,
  RegistrationType,
} from "@/features/customers/data/types";

const registrationTypeLabel: Record<RegistrationType, string> = {
  new: "Baru",
  existing: "Lama",
  survey: "Survey",
};

export function CustomerProfileCard({ customer }: { customer: CustomerView }) {
  const address = customer.primaryAddress;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Kontak & identitas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-5 text-sm">
          <p className="flex items-center gap-2">
            <PhoneIcon className="size-4 text-muted-foreground" />
            {customer.primaryPhone}
            {customer.secondaryPhone ? (
              <span className="text-muted-foreground">
                · {customer.secondaryPhone}
              </span>
            ) : null}
          </p>
          <p className="text-muted-foreground">{customer.primaryEmail || "-"}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {customer.primaryIdentity
              ? `${customer.primaryIdentity.identityType.toUpperCase()} · ${customer.primaryIdentity.identityNumber}`
              : "Belum ada identitas"}
          </p>
          {customer.primaryIdentity?.fileName ? (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileTextIcon className="size-4" />
              {customer.primaryIdentity.fileName}
            </p>
          ) : null}
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <UserRoundIcon className="size-4" />
            Sales: {customer.salesName}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <StatusBadge tone="primary">
              {registrationTypeLabel[customer.registrationType] ?? "Lama"}
            </StatusBadge>
            <StatusBadge tone="neutral">
              {customer.customerType === "business"
                ? "Bisnis"
                : "Residensial"}
            </StatusBadge>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Alamat utama</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-5 text-sm">
          {address ? (
            <>
              <p className="flex items-start gap-2">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span>
                  {address.addressLine}
                  <br />
                  {address.village}, {address.district}
                  <br />
                  {address.city}, {address.province} {address.postalCode}
                </span>
              </p>
              {typeof address.latitude === "number" &&
              typeof address.longitude === "number" ? (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${address.latitude}&mlon=${address.longitude}#map=17/${address.latitude}/${address.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block font-mono text-xs text-primary underline underline-offset-4"
                >
                  {address.latitude}, {address.longitude}
                </a>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Koordinat belum diisi.
                </p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">Belum ada alamat.</p>
          )}
        </CardContent>
      </Card>

      <Card className="gap-0 py-0 md:col-span-2">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Info pelanggan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 p-5 text-sm sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <p className="text-xs text-muted-foreground">ID pelanggan</p>
            <p className="font-mono text-xs font-medium">
              {customer.customerNumber}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cabang</p>
            <p className="font-medium">{customer.branchName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <StatusBadge tone={customerStatusTone[customer.status]}>
              {customerStatusLabel[customer.status]}
            </StatusBadge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Terdaftar</p>
            <p className="font-medium">{customer.registeredAt}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Catatan</p>
            <p className="text-muted-foreground">{customer.notes || "-"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
