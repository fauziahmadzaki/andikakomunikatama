"use client";

import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../api/auth-api";
import { useAuthStore } from "../store/auth-store";
import { useAuditStore } from "@/features/audit/store/audit-store";
import type { LoginValues } from "../data/login-schema";
import type { Session } from "../data/session";

export function useLoginMutation() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (credentials: LoginValues) => loginApi(credentials),
    onSuccess: (data) => {
      const session: Session = {
        ...data.user,
        token: data.token,
      };

      setSession(session);

      useAuditStore.getState().addAudit({
        action: "auth.login_succeeded",
        entityType: "user",
        entityId: session.id,
        actor: session.name,
        branch: session.branchName,
        description: "Login berhasil via backend API.",
      });
    },
    onError: (error: Error, variables) => {
      useAuditStore.getState().addAudit({
        action: "auth.login_failed",
        entityType: "user",
        entityId: variables.identifier,
        actor: variables.identifier,
        branch: "JKT-01",
        description: `Percobaan login gagal: ${error.message}`,
      });
    },
  });
}
