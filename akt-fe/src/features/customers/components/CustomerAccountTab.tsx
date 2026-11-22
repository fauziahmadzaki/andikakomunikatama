"use client";

import { PencilIcon } from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerAccount } from "@/features/customers/data/types";
import { formatDateTime } from "@/lib/format";

export function CustomerAccountTab({
  account,
  onEdit,
}: {
  account?: CustomerAccount;
  onEdit: () => void;
}) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
        <CardTitle>Akun portal pelanggan</CardTitle>
        <Button variant="outline" size="sm" onPress={onEdit}>
          <PencilIcon />
          {account ? "Edit akun" : "Buat akun"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 p-5 text-sm">
        {account ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{account.email || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Telepon</p>
                <p className="font-medium">{account.phone || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge tone={account.isActive ? "success" : "neutral"}>
                  {account.isActive ? "Aktif" : "Nonaktif"}
                </StatusBadge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Login terakhir</p>
                <p className="font-medium">
                  {formatDateTime(account.lastLoginAt)}
                </p>
              </div>
            </div>
            <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              Password akun portal tidak ditampilkan di prototype. Gunakan alur
              reset password pada implementasi backend.
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">
            Pelanggan belum memiliki akun portal.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
