"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useBillingStore } from "@/features/billing/store/billing-store";
import { useCustomerStore } from "@/features/customers/store/customer-store";
import type { NotificationChannel } from "@/features/notifications/data/types";
import { useNotificationStore } from "@/features/notifications/store/notification-store";

export function useNotificationsPage() {
  const templates = useNotificationStore((state) => state.templates);
  const addTemplate = useNotificationStore((state) => state.addTemplate);
  const toggleTemplate = useNotificationStore((state) => state.toggleTemplate);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    eventCode: "",
    name: "",
    channel: "whatsapp" as NotificationChannel,
    subject: "",
    body: "",
    isActive: true,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function save() {
    if (!form.name.trim() || !form.eventCode.trim()) {
      toast.error("Nama dan event code wajib diisi.");
      return;
    }
    addTemplate(form);
    toast.success("Template dibuat.");
    setOpen(false);
  }

  function toggle(templateId: string) {
    toggleTemplate(templateId);
    toast.success("Status template diubah.");
  }

  return { templates, open, setOpen, form, set, save, toggle };
}

export function useBlastPage() {
  const templates = useNotificationStore((state) => state.templates);
  const sendBlast = useNotificationStore((state) => state.sendBlast);
  const customers = useCustomerStore((state) => state.customers);
  const invoices = useBillingStore((state) => state.invoices);
  const [channel, setChannel] = useState<NotificationChannel>("whatsapp");
  const [segment, setSegment] = useState("all");
  const [result, setResult] = useState<number | null>(null);

  const customersWithOutstanding = new Set(
    invoices
      .filter(
        (invoice) =>
          invoice.status !== "void" && invoice.total - invoice.paidAmount > 0
      )
      .map((invoice) => invoice.customerId)
  );

  const recipients =
    segment === "all"
      ? customers.length
      : segment === "active"
        ? customers.filter((customer) => customer.status === "active").length
        : customers.filter((customer) =>
            customersWithOutstanding.has(customer.id)
          ).length;

  function send() {
    sendBlast(channel, recipients);
    setResult(recipients);
    toast.success(`${recipients} pesan dikirim.`);
  }

  return {
    templates,
    channel,
    setChannel,
    segment,
    setSegment,
    recipients,
    result,
    send,
  };
}

export function useLogsPage() {
  const logs = useNotificationStore((state) => state.logs);
  const retryLog = useNotificationStore((state) => state.retryLog);
  return {
    logs,
    retry: (id: string) => {
      retryLog(id);
      toast.success("Pesan dicoba ulang.");
    },
  };
}
