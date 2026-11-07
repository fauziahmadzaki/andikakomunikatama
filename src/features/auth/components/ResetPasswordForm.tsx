"use client";

import Link from "next/link";
import { CheckCircle2Icon } from "lucide-react";

import { Button, LinkButton } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";

export function ResetPasswordForm() {
  const { done, submit } = useResetPassword();

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <CheckCircle2Icon className="size-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Password berhasil diubah</p>
          <p className="text-sm text-muted-foreground">
            Semua sesi lama telah dicabut. Silakan masuk dengan password baru.
          </p>
        </div>
        <LinkButton href="/login" className="w-full">
          Masuk
        </LinkButton>
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        Mode demo: token reset disimulasikan valid.
      </div>

      <Field>
        <FieldLabel htmlFor="new-password">Password baru</FieldLabel>
        <Input
          id="new-password"
          type="password"
          placeholder="Minimal 12 karakter"
          required
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="confirm-password">Konfirmasi password</FieldLabel>
        <Input
          id="confirm-password"
          type="password"
          placeholder="Ulangi password baru"
          required
        />
      </Field>

      <Button type="submit" className="w-full">
        Simpan password
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Kembali ke login
        </Link>
      </p>
    </form>
  );
}
