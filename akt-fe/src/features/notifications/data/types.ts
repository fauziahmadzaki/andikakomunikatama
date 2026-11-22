export type NotificationChannel = "whatsapp" | "email" | "telegram";

export type NotificationTemplate = {
  id: string;
  eventCode: string;
  name: string;
  channel: NotificationChannel;
  subject: string;
  body: string;
  isActive: boolean;
};

export type NotificationLog = {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  templateName: string;
  status: "sent" | "failed" | "queued";
  sentAt: string;
  error?: string;
};
