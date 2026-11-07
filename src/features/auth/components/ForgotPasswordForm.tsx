"use client";

import Link from "next/link";
import { MailCheckIcon } from "lucide-react";

import { Button, LinkButton } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";

export function ForgotPasswordForm() {
  const { email, setEmail, sent, submit } = useForgotPassword();

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheckIcon className="size-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Tautan reset dikirim</p>
          <p className="text-sm text-muted-foreground">
            Jika <span className="font-medium">{email}</span> terdaftar, tautan
            reset password akan dikirim. Tautan berlaku 30 menit.
          </p>
        </div>
        <LinkButton href="/login" className="w-full">
          Kembali ke login
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
      <p className="text-sm text-muted-foreground">
        Masukkan email atau username akun MuraNET. Kami akan mengirim tautan
        reset password.
      </p>

      <Field>
        <FieldLabel htmlFor="forgot-email">Email atau username</FieldLabel>
        <Input
          id="forgot-email"
          type="text"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nama@muranet.id"
          required
        />
      </Field>

      <Button type="submit" className="w-full">
        Kirim tautan reset
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Ingat password?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
