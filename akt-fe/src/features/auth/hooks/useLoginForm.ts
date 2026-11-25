"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  loginSchema,
  type LoginValues,
} from "@/features/auth/data/login-schema";
import { useLoginMutation } from "./useLoginMutation";

export function useLoginForm() {
  const router = useRouter();
  const { mutateAsync: loginMutate, isPending } = useLoginMutation();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    form.clearErrors("root");

    try {
      await loginMutate(values);
      router.replace("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Username/email atau kata sandi salah.";
      form.setError("root.server", { message });
    }
  }

  return {
    register: form.register,
    handleSubmit: form.handleSubmit,
    errors: form.formState.errors,
    isSubmitting: isPending,
    onSubmit,
  };
}
