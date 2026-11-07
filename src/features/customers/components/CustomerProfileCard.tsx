"use client";

import { MapPinIcon, PhoneIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Customer } from "@/features/customers/data/types";

export function CustomerProfileCard({ customer }: { customer: Customer }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Kontak & identitas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-5 text-sm">
          <p className="flex items-center gap-2">
            <PhoneIcon className="size-4 text-muted-foreground" />
            {customer.phone}
          </p>
          <p className="text-muted-foreground">{customer.email || "-"}</p>
          <p className="font-mono text-xs text-muted-foreground">{customer.nik}</p>
          <p className="text-xs text-muted-foreground">
            Tipe: {customer.customerType === "business" ? "Bisnis" : "Residensial"}
          </p>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Alamat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-5 text-sm">
          <p className="flex items-start gap-2">
            <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span>
              {customer.address}
              <br />
              {customer.village}, {customer.district}
              <br />
              {customer.city}, {customer.province} {customer.postalCode}
            </span>
          </p>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0 md:col-span-2">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Catatan</CardTitle>
        </CardHeader>
        <CardContent className="p-5 text-sm text-muted-foreground">
          {customer.notes || "Tidak ada catatan."}
        </CardContent>
      </Card>
    </div>
  );
}
