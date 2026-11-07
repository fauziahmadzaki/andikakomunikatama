"use client";

import { useMemo, useState } from "react";

import { useFoundationStore } from "@/features/foundation/store/foundation-store";

export function useAuditLog() {
  const auditLogs = useFoundationStore((state) => state.auditLogs);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("all");

  const actions = useMemo(
    () => Array.from(new Set(auditLogs.map((log) => log.action))).sort(),
    [auditLogs]
  );

  const filtered = useMemo(
    () =>
      auditLogs.filter((log) => {
        const matchesQuery =
          !query ||
          `${log.action} ${log.actor} ${log.entityId} ${log.description}`
            .toLowerCase()
            .includes(query.toLowerCase());
        const matchesAction = action === "all" || log.action === action;
        return matchesQuery && matchesAction;
      }),
    [action, auditLogs, query]
  );

  return { query, setQuery, action, setAction, actions, filtered };
}
