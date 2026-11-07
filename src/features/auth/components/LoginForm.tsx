"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLoginForm } from "@/features/auth/hooks/useLoginForm";

export function LoginForm() {
  const { register, handleSubmit, errors, onSubmit } = useLoginForm();

  return (
    <form
      className="flex flex-col gap-6"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <Field data-invalid={Boolean(errors.identifier)}>
          <FieldLabel htmlFor="identifier">Email atau ID karyawan</FieldLabel>
          <Input
            id="identifier"
            type="text"
            autoComplete="username"
            placeholder="nama@muranet.id"
            aria-invalid={Boolean(errors.identifier)}
            aria-describedby={
              errors.identifier ? "identifier-error" : undefined
            }
            {...register("identifier")}
          />
          <FieldError id="identifier-error">
            {errors.identifier?.message}
          </FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.password)}>
          <div className="flex items-center justify-between gap-2">
            <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Lupa kata sandi?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          <FieldError id="password-error">{errors.password?.message}</FieldError>
        </Field>
      </FieldGroup>

      {errors.root?.server?.message ? (
        <p role="alert" className="text-sm font-normal text-destructive">
          {errors.root.server.message}
        </p>
      ) : null}

      <Button type="submit" className="w-full">
        Masuk
      </Button>

      <p className="rounded-lg bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground">
        Demo: <span className="font-medium">admin / admin123</span> ·{" "}
        <span className="font-medium">cs / cs123456</span> ·{" "}
        <span className="font-medium">teknisi / teknisi123</span>
      </p>
    </form>
  );
}
