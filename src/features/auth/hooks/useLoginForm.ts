"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  loginSchema,
  type LoginValues,
} from "@/features/auth/data/login-schema";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function useLoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  function onSubmit(values: LoginValues) {
    form.clearErrors("root");

    const result = login(values.identifier, values.password);

    if (!result.ok) {
      form.setError("root.server", { message: result.error });
      return;
    }

    router.replace("/dashboard");
  }

  return {
    register: form.register,
    handleSubmit: form.handleSubmit,
    errors: form.formState.errors,
    onSubmit,
  };
}
