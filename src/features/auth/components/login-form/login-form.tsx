"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { findLocalUser } from "@/features/auth/data/users";
import { loginSchema, type LoginValues } from "./data/schema";

export function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  function onSubmit(values: LoginValues) {
    clearErrors("root");

    const user = findLocalUser(values.identifier, values.password);

    if (!user) {
      setError("root.server", {
        message: "Email/ID atau kata sandi salah.",
      });
      return;
    }

    router.replace("/dashboard");
  }

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
          <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
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
    </form>
  );
}
