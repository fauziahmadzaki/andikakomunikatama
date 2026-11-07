"use client";

import { KeyRoundIcon, ShieldCheckIcon, SmartphoneIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { roleLabels } from "@/features/auth/data/users";
import { useSecuritySettings } from "@/features/foundation/hooks/useSecuritySettings";

export function SecurityPage() {
  const { session, currentUser, security, toggleTwoFactor } =
    useSecuritySettings();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        title="Keamanan"
        description="Ringkasan sesi, 2FA, dan kebijakan keamanan akun."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="gap-0 py-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle>Sesi aktif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nama</span>
              <span className="font-medium">{session?.name ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Role</span>
              <StatusBadge tone="primary">
                {session ? roleLabels[session.role] : "-"}
              </StatusBadge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cabang</span>
              <span>{session?.branchName ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Idle timeout</span>
              <span>60 menit</span>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle>Autentikasi dua faktor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <SmartphoneIcon className="size-5" />
              </span>
              <div className="space-y-1 text-sm">
                <p className="font-medium">
                  {currentUser?.twoFactorEnabled
                    ? "2FA aktif"
                    : "2FA belum aktif"}
                </p>
                <p className="text-muted-foreground">
                  Gunakan aplikasi authenticator untuk kode 6 digit saat login.
                </p>
              </div>
            </div>
            <Button
              variant={currentUser?.twoFactorEnabled ? "outline" : "default"}
              className="w-full"
              onPress={toggleTwoFactor}
            >
              <ShieldCheckIcon />
              {currentUser?.twoFactorEnabled ? "Nonaktifkan 2FA" : "Aktifkan 2FA"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Kebijakan keamanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          {security?.fields.map((field) => (
            <div
              key={field.key}
              className="flex flex-col gap-1 border-b pb-3 text-sm last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{field.label}</p>
                <p className="text-xs text-muted-foreground">
                  {field.description}
                </p>
              </div>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                {String(field.value)}
                {field.suffix ? ` ${field.suffix}` : ""}
              </span>
            </div>
          ))}
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <KeyRoundIcon className="mt-0.5 size-3.5 shrink-0" />
            Mode prototype: 2FA, reset password, dan session expiry disimulasikan.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
