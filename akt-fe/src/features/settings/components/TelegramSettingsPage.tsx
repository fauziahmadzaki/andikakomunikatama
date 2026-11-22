"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  PlusIcon,
  SendIcon,
  PencilIcon,
  Trash2Icon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/DataTable";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api-client";
import type { TelegramChannel } from "@/features/network/sla/types";

export function TelegramSettingsPage() {
  const [channels, setChannels] = useState<TelegramChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<TelegramChannel | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [threadId, setThreadId] = useState("");
  const [notifyDown, setNotifyDown] = useState(true);
  const [notifyUp, setNotifyUp] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/monitoring/telegram-channels");
      if (res.data?.success) {
        setChannels(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat channel Telegram");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const resetForm = () => {
    setName("");
    setBotToken("");
    setChatId("");
    setThreadId("");
    setNotifyDown(true);
    setNotifyUp(true);
    setIsEnabled(true);
    setEditingChannel(null);
    setShowToken(false);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (ch: TelegramChannel) => {
    setName(ch.name);
    setBotToken(ch.botToken);
    setChatId(ch.chatId);
    setThreadId(ch.threadId ? String(ch.threadId) : "");
    setNotifyDown(ch.notifyDown);
    setNotifyUp(ch.notifyUp);
    setIsEnabled(ch.isEnabled);
    setEditingChannel(ch);
    setDialogOpen(true);
  };

  const handleTest = async (ch: TelegramChannel) => {
    setTestingId(ch.id);
    try {
      const res = await apiClient.post(`/monitoring/telegram-channels/${ch.id}/test`);
      if (res.data?.success) {
        toast.success(`Pesan test berhasil terkirim ke "${ch.name}"!`);
      } else {
        toast.error(res.data?.message || "Gagal mengirim pesan test");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menghubungi bot Telegram");
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = async (ch: TelegramChannel) => {
    if (!confirm(`Hapus channel "${ch.name}"?`)) return;
    try {
      await apiClient.delete(`/monitoring/telegram-channels/${ch.id}`);
      toast.success("Channel Telegram berhasil dihapus");
      fetchChannels();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus channel");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !botToken.trim() || !chatId.trim()) {
      toast.error("Nama channel, Bot Token, dan Chat ID wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        botToken: botToken.trim(),
        chatId: chatId.trim(),
        threadId: threadId.trim() ? Number(threadId) : null,
        notifyDown,
        notifyUp,
        isEnabled,
      };

      if (editingChannel) {
        await apiClient.put(`/monitoring/telegram-channels/${editingChannel.id}`, payload);
        toast.success("Channel Telegram berhasil diperbarui");
      } else {
        await apiClient.post("/monitoring/telegram-channels", payload);
        toast.success("Channel Telegram berhasil ditambahkan");
      }

      setDialogOpen(false);
      resetForm();
      fetchChannels();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan konfigurasi Telegram");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: DataTableColumn<TelegramChannel>[] = [
    {
      key: "name",
      header: "Channel / Grup",
      cell: (ch) => (
        <div>
          <p className="font-medium text-foreground">{ch.name}</p>
          <p className="font-mono text-xs text-muted-foreground">
            Chat ID: {ch.chatId} {ch.threadId ? `(Topic: ${ch.threadId})` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (ch) => (
        <StatusBadge tone={ch.isEnabled ? "success" : "neutral"}>
          {ch.isEnabled ? "Aktif" : "Nonaktif"}
        </StatusBadge>
      ),
    },
    {
      key: "triggers",
      header: "Kriteria Alert",
      cell: (ch) => (
        <div className="flex items-center gap-2 text-xs">
          <span className={ch.notifyDown ? "text-rose-600 font-medium" : "text-muted-foreground/40 line-through"}>
            DOWN
          </span>
          <span>•</span>
          <span className={ch.notifyUp ? "text-emerald-600 font-medium" : "text-muted-foreground/40 line-through"}>
            UP
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (ch) => (
        <div className="flex items-center justify-end gap-1">
          <ActionIconButton
            icon={SendIcon}
            label={testingId === ch.id ? "Mengirim test..." : "Kirim pesan test"}
            isDisabled={testingId === ch.id}
            onPress={() => handleTest(ch)}
          />
          <ActionIconButton
            icon={PencilIcon}
            label="Edit channel"
            onPress={() => openEdit(ch)}
          />
          <ActionIconButton
            icon={Trash2Icon}
            label="Hapus channel"
            tone="destructive"
            onPress={() => handleDelete(ch)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Pengaturan Telegram"
        description="Kelola bot dan grup/channel Telegram untuk menerima notifikasi otomatis saat host atau router mengalami gangguan (DOWN) dan pemulihan (UP)."
      >
        <Button onPress={openCreate}>
          <PlusIcon />
          Tambah Bot / Channel
        </Button>
      </PageHeader>

      {/* KPI Info Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="gap-0 py-0">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Total Bot / Channel</p>
            <p className="text-2xl font-bold tracking-tight">{channels.length}</p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-0">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Channel Aktif</p>
            <p className="text-2xl font-bold tracking-tight text-emerald-600">
              {channels.filter((c) => c.isEnabled).length}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-0">
          <CardContent className="space-y-1 p-5">
            <p className="text-sm text-muted-foreground">Status Integrasi</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {channels.some((c) => c.isEnabled) ? "Siap Kirim" : "Belum Ada Channel"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 py-0">
        <CardContent className="p-4">
          <DataTable
            data={channels}
            columns={columns}
            getRowKey={(ch) => ch.id}
            ariaLabel="Daftar konfigurasi bot Telegram"
            emptyMessage={
              loading
                ? "Memuat konfigurasi Telegram..."
                : "Belum ada bot atau channel Telegram. Klik 'Tambah Bot / Channel' untuk menambahkan."
            }
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog isOpen={dialogOpen} onOpenChange={(open) => !open && setDialogOpen(false)}>
        <div className="w-full max-w-lg p-6 bg-background rounded-lg border shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingChannel ? "Edit Channel Telegram" : "Tambah Bot / Channel Telegram"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Masukkan token bot dari @BotFather dan Chat ID / Group ID penerima.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            <Field>
              <FieldLabel className="text-xs">Nama Channel / Penerima</FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="misal: Grup NOC Alerting, Channel Insiden"
                className="text-xs h-9"
                required
              />
            </Field>

            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel className="text-xs">Bot Token</FieldLabel>
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="text-[11px] text-muted-foreground flex items-center gap-1 hover:text-foreground"
                >
                  {showToken ? <EyeOffIcon className="w-3 h-3" /> : <EyeIcon className="w-3 h-3" />}
                  {showToken ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
              <Input
                type={showToken ? "text" : "password"}
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="1234567890:ABC-DEF..."
                className="text-xs h-9 font-mono"
                required
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field>
                <FieldLabel className="text-xs">Chat ID / Group ID</FieldLabel>
                <Input
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="misal: -100123456789"
                  className="text-xs h-9 font-mono"
                  required
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs">Topic ID (Opsional)</FieldLabel>
                <Input
                  type="number"
                  value={threadId}
                  onChange={(e) => setThreadId(e.target.value)}
                  placeholder="Kosongkan jika bukan topic"
                  className="text-xs h-9 font-mono"
                />
              </Field>
            </div>

            <div className="pt-2 border-t space-y-2 text-xs">
              <div className="font-semibold text-foreground">Kriteria Notifikasi</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="flex items-center gap-2 p-2 rounded border bg-muted/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyDown}
                    onChange={(e) => setNotifyDown(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <span>Alert DOWN</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded border bg-muted/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyUp}
                    onChange={(e) => setNotifyUp(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <span>Alert UP</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded border bg-muted/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <span>Status Aktif</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onPress={() => setDialogOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button type="submit" size="sm" isDisabled={isSubmitting} className="text-xs">
                {isSubmitting ? "Menyimpan..." : editingChannel ? "Perbarui" : "Simpan Channel"}
              </Button>
            </div>
          </form>

          <DialogFooter className="mt-4 pt-3 border-t">
            <Button variant="outline" size="sm" onPress={() => setDialogOpen(false)} className="text-xs">
              Tutup
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}
