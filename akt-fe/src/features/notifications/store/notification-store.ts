import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateUUID } from "@/lib/uuid";

import { useAuditStore } from "@/features/audit/store/audit-store";
import { seedLogs, seedTemplates } from "../data/seed";
import type { NotificationLog, NotificationTemplate } from "../data/types";

type NewTemplate = Omit<NotificationTemplate, "id">;

type NotificationState = {
  templates: NotificationTemplate[];
  logs: NotificationLog[];
  addTemplate: (input: NewTemplate) => void;
  toggleTemplate: (id: string) => void;
  sendBlast: (channel: NotificationLog["channel"], recipients: number) => void;
  retryLog: (id: string) => void;
  resetNotifications: () => void;
};

function id() {
  return generateUUID();
}

function audit(action: string, entityId: string, description: string) {
  useAuditStore.getState().addAudit({
    action,
    entityType: "notification",
    entityId,
    actor: "Administrator",
    branch: "JKT-01",
    description,
  });
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      templates: seedTemplates,
      logs: seedLogs,

      addTemplate: (input) => {
        const template: NotificationTemplate = { ...input, id: id() };
        set((state) => ({ templates: [template, ...state.templates] }));
        audit("notification_template.created", template.name, `Template ${template.name} dibuat.`);
      },

      toggleTemplate: (templateId) => {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === templateId
              ? { ...template, isActive: !template.isActive }
              : template
          ),
        }));
      },

      sendBlast: (channel, recipients) => {
        const template = get().templates.find(
          (item) => item.channel === channel && item.isActive
        );
        const now = new Date().toISOString();
        const logs: NotificationLog[] = Array.from({ length: recipients }).map(
          (_, index) => ({
            id: id(),
            channel,
            recipient: `recipient-${index + 1}`,
            templateName: template?.name ?? "Blast",
            status: "sent",
            sentAt: now,
          })
        );
        set((state) => ({ logs: [...logs, ...state.logs] }));
        audit("notification.blast_sent", `blast-${Date.now()}`, `${recipients} pesan dikirim via ${channel}.`);
      },

      retryLog: (logId) => {
        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === logId
              ? { ...log, status: "sent", error: undefined, sentAt: new Date().toISOString() }
              : log
          ),
        }));
      },

      resetNotifications: () => set({ templates: seedTemplates, logs: seedLogs }),
    }),
    { name: "muranet-notifications", skipHydration: true }
  )
);
