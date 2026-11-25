"use client";

import { useState } from "react";
import Link from "next/link";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { useLoginForm } from "@/features/auth/hooks/useLoginForm";

export function LoginForm() {
  const { register, handleSubmit, errors, isSubmitting, onSubmit } = useLoginForm();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      className="flex flex-col gap-6"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <Field data-invalid={Boolean(errors.identifier)}>
          <FieldLabel htmlFor="identifier">Username atau email</FieldLabel>
          <Input
            id="identifier"
            type="text"
            autoComplete="username"
            placeholder="username atau email"
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
          <InputGroup>
            <InputGroupInput
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            <InputGroupAddon align="inline-end">
              <TooltipTrigger>
                <InputGroupButton
                  type="button"
                  size="icon-sm"
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                  onPress={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </InputGroupButton>
                <Tooltip>
                  {showPassword
                    ? "Sembunyikan kata sandi"
                    : "Tampilkan kata sandi"}
                </Tooltip>
              </TooltipTrigger>
            </InputGroupAddon>
          </InputGroup>
          <FieldError id="password-error">{errors.password?.message}</FieldError>
        </Field>
      </FieldGroup>

      {errors.root?.server?.message ? (
        <p role="alert" className="text-sm font-normal text-destructive">
          {errors.root.server.message}
        </p>
      ) : null}

      <Button type="submit" className="w-full" isDisabled={isSubmitting}>
        {isSubmitting ? "Memproses..." : "Masuk"}
      </Button>
    </form>
  );
}
