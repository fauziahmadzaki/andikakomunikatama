"use client";

import { BanIcon, BellIcon, CheckCircleIcon, PlusIcon, SendIcon } from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { SelectField } from "@/components/shared/SelectField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, LinkButton } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  NotificationChannel,
  NotificationTemplate,
} from "@/features/notifications/data/types";
import { useNotificationsPage } from "@/features/notifications/hooks/useNotifications";

export function NotificationsPage() {
  const { templates, open, setOpen, form, set, save, toggle } =
    useNotificationsPage();

  const columns: DataTableColumn<NotificationTemplate>[] = [
    {
      key: "name",
      header: "Template",
      cell: (template) => (
        <div>
          <p className="font-medium">{template.name}</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {template.eventCode}
          </p>
        </div>
      ),
    },
    {
      key: "channel",
      header: "Channel",
      cell: (template) => (
        <StatusBadge tone="primary">{template.channel}</StatusBadge>
      ),
    },
    {
      key: "subject",
      header: "Subjek",
      cell: (template) => (
        <span className="text-muted-foreground">{template.subject}</span>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      cell: (template) => (
        <StatusBadge tone={template.isActive ? "success" : "neutral"}>
          {template.isActive ? "Aktif" : "Nonaktif"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (template) => (
        <ActionIconButton
          icon={template.isActive ? BanIcon : CheckCircleIcon}
          label={template.isActive ? "Nonaktifkan template" : "Aktifkan template"}
          tone={template.isActive ? "destructive" : "default"}
          onPress={() => toggle(template.id)}
        />
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Notifikasi"
        description="Kelola template, blast, dan log pengiriman."
      >
        <LinkButton href="/dashboard/notifikasi/log" variant="outline">
          <BellIcon />
          Log
        </LinkButton>
        <LinkButton href="/dashboard/notifikasi/blast" variant="outline">
          <SendIcon />
          Blast
        </LinkButton>
        <Button onPress={() => setOpen(true)}>
          <PlusIcon />
          Template
        </Button>
      </PageHeader>

      <Card className="gap-0 py-0">
        <CardContent className="p-4">
          <DataTable
            data={templates}
            columns={columns}
            getRowKey={(template) => template.id}
            ariaLabel="Daftar template notifikasi"
            emptyMessage="Belum ada template."
          />
        </CardContent>
      </Card>

      <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && setOpen(false)}>
        <DialogHeader>
          <DialogTitle>Template notifikasi</DialogTitle>
          <DialogDescription>
            Placeholder didukung untuk event terkait.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="template-name">Nama</FieldLabel>
              <Input
                id="template-name"
                value={form.name}
                onChange={(event) => set("name", event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="template-event">Event code</FieldLabel>
              <Input
                id="template-event"
                value={form.eventCode}
                onChange={(event) => set("eventCode", event.target.value)}
              />
            </Field>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Channel</p>
            <SelectField
              value={form.channel}
              onValueChange={(value) =>
                set("channel", value as NotificationChannel)
              }
              ariaLabel="Channel notifikasi"
              options={[
                { value: "whatsapp", label: "WhatsApp" },
                { value: "email", label: "Email" },
                { value: "telegram", label: "Telegram" },
              ]}
            />
          </div>
          <Field>
            <FieldLabel htmlFor="template-subject">Subjek</FieldLabel>
            <Input
              id="template-subject"
              value={form.subject}
              onChange={(event) => set("subject", event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="template-body">Body</FieldLabel>
            <Textarea
              id="template-body"
              rows={4}
              value={form.body}
              onChange={(event) => set("body", event.target.value)}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onPress={() => setOpen(false)}>
            Batal
          </Button>
          <Button onPress={save}>Simpan</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
