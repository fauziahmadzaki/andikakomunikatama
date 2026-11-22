"use client";

import { ArrowLeftIcon, SendIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { SelectField } from "@/components/shared/SelectField";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBlastPage } from "@/features/notifications/hooks/useNotifications";

export function BlastPage() {
  const {
    channel,
    setChannel,
    segment,
    setSegment,
    recipients,
    result,
    send,
  } = useBlastPage();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-3">
        <LinkButton
          href="/dashboard/notifikasi"
          variant="ghost"
          size="sm"
          className="-ml-2"
        >
          <ArrowLeftIcon />
          Kembali ke notifikasi
        </LinkButton>
        <PageHeader
          title="Blast notifikasi"
          description="Kirim pesan ke segmen pelanggan."
        />
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle>Target & channel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Channel</p>
            <SelectField
              value={channel}
              onValueChange={(value) =>
                setChannel(value as typeof channel)
              }
              ariaLabel="Channel blast"
              options={[
                { value: "whatsapp", label: "WhatsApp" },
                { value: "email", label: "Email" },
                { value: "telegram", label: "Telegram" },
              ]}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Segmen</p>
            <SelectField
              value={segment}
              onValueChange={setSegment}
              ariaLabel="Segmen blast"
              options={[
                { value: "all", label: "Semua pelanggan" },
                { value: "active", label: "Pelanggan aktif" },
                { value: "unpaid", label: "Belum lunas" },
              ]}
            />
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Penerima</span>
              <span className="font-semibold">{recipients}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Opt-out dan quiet hours diterapkan pada pengiriman nyata.
            </p>
          </div>
          <Button className="w-full" onPress={send}>
            <SendIcon />
            Kirim blast
          </Button>
          {result !== null ? (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
              Blast terkirim ke {result} penerima.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
