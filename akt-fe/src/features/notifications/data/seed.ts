import type { NotificationLog, NotificationTemplate } from "./types";

export const seedTemplates: NotificationTemplate[] = [
  {
    id: "tpl-001",
    eventCode: "invoice.issued",
    name: "Invoice terbit",
    channel: "whatsapp",
    subject: "Invoice {{invoice_number}}",
    body: "Halo {{customer_name}}, invoice {{invoice_number}} sebesar {{total}} sudah terbit. Jatuh tempo {{due_date}}.",
    isActive: true,
  },
  {
    id: "tpl-002",
    eventCode: "payment.verified",
    name: "Pembayaran diterima",
    channel: "whatsapp",
    subject: "Pembayaran diterima",
    body: "Terima kasih {{customer_name}}, pembayaran sebesar {{amount}} sudah kami terima.",
    isActive: true,
  },
  {
    id: "tpl-003",
    eventCode: "invoice.reminder",
    name: "Pengingat jatuh tempo",
    channel: "email",
    subject: "Pengingat tagihan {{invoice_number}}",
    body: "Tagihan {{invoice_number}} akan jatuh tempo pada {{due_date}}.",
    isActive: true,
  },
  {
    id: "tpl-004",
    eventCode: "ticket.assigned",
    name: "Tiket ditugaskan",
    channel: "telegram",
    subject: "Tiket baru",
    body: "Tiket {{ticket_number}} ditugaskan kepada {{technician}}.",
    isActive: false,
  },
];

export const seedLogs: NotificationLog[] = [
  {
    id: "log-001",
    channel: "whatsapp",
    recipient: "+62 812 3456 7890",
    templateName: "Invoice terbit",
    status: "sent",
    sentAt: "2026-11-07T09:00:00+07:00",
  },
  {
    id: "log-002",
    channel: "whatsapp",
    recipient: "+62 813 2211 4455",
    templateName: "Pengingat jatuh tempo",
    status: "failed",
    sentAt: "2026-11-07T09:05:00+07:00",
    error: "Device disconnected",
  },
  {
    id: "log-003",
    channel: "email",
    recipient: "budi.santoso@email.com",
    templateName: "Invoice terbit",
    status: "sent",
    sentAt: "2026-11-07T09:10:00+07:00",
  },
  {
    id: "log-004",
    channel: "telegram",
    recipient: "NOC Group",
    templateName: "Tiket ditugaskan",
    status: "sent",
    sentAt: "2026-11-07T10:00:00+07:00",
  },
];
