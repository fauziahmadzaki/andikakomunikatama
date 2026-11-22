"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  SendIcon,
  Trash2Icon,
  Edit2Icon,
  PlusIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";

import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { TelegramChannel } from "../types";

export function TelegramChannelsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [channels, setChannels] = useState<TelegramChannel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  // Form mode: null (list mode), 'create', or channel ID (edit mode)
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
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
    setIsLoading(true);
    try {
      const res = await apiClient.get("/monitoring/telegram-channels");
      if (res.data?.success) {
        setChannels(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat daftar channel Telegram");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchChannels();
      setMode("list");
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setName("");
    setBotToken("");
    setChatId("");
    setThreadId("");
    setNotifyDown(true);
    setNotifyUp(true);
    setIsEnabled(true);
    setEditingId(null);
    setShowToken(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setMode("create");
  };

  const handleOpenEdit = (channel: TelegramChannel) => {
    setName(channel.name);
    setBotToken(channel.botToken);
    setChatId(channel.chatId);
    setThreadId(channel.threadId ? String(channel.threadId) : "");
    setNotifyDown(channel.notifyDown);
    setNotifyUp(channel.notifyUp);
    setIsEnabled(channel.isEnabled);
    setEditingId(channel.id);
    setMode("edit");
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
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

      if (mode === "create") {
        await apiClient.post("/monitoring/telegram-channels", payload);
        toast.success("Channel Telegram berhasil ditambahkan");
      } else if (mode === "edit" && editingId) {
        await apiClient.put(`/monitoring/telegram-channels/${editingId}`, payload);
        toast.success("Channel Telegram berhasil diperbarui");
      }

      await fetchChannels();
      setMode("list");
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan channel Telegram");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, channelName: string) => {
    if (!confirm(`Hapus konfigurasi channel "${channelName}"?`)) return;

    try {
      await apiClient.delete(`/monitoring/telegram-channels/${id}`);
      toast.success("Channel Telegram berhasil dihapus");
      fetchChannels();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus channel");
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const res = await apiClient.post(`/monitoring/telegram-channels/${id}/test`);
      if (res.data?.success) {
        toast.success("Pesan test berhasil dikirim ke Telegram!");
      } else {
        toast.error(res.data?.message || "Gagal mengirim pesan test");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim pesan test ke Telegram");
    } finally {
      setTestingId(null);
    }
  };

  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <div className="w-full max-w-2xl p-6 bg-background rounded-lg border shadow-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold">
                {mode === "list"
                  ? "Alerting Telegram"
                  : mode === "create"
                  ? "Tambah Channel Telegram"
                  : "Edit Channel Telegram"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                {mode === "list"
                  ? "Kelola bot dan grup/channel Telegram untuk menerima notifikasi kejadian UP / DOWN secara instan."
                  : "Masukkan bot token dari @BotFather dan Chat ID penerima."}
              </DialogDescription>
            </div>
            {mode === "list" && (
              <Button size="sm" onPress={handleOpenCreate} className="h-8 text-xs gap-1">
                <PlusIcon className="w-3.5 h-3.5" />
                Tambah Bot / Channel
              </Button>
            )}
          </div>
        </DialogHeader>

        {mode === "list" ? (
          <div className="py-4 space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                Memuat channel Telegram...
              </div>
            ) : channels.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg space-y-2">
                <p className="text-xs text-muted-foreground">
                  Belum ada channel Telegram yang dikonfigurasi.
                </p>
                <Button size="sm" variant="outline" onPress={handleOpenCreate} className="text-xs">
                  Tambah Channel Pertama
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {channels.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-3.5 rounded-lg border bg-card/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">{ch.name}</span>
                        <Badge
                          variant={ch.isEnabled ? "default" : "outline"}
                          className={`text-[10px] px-1.5 py-0 ${
                            ch.isEnabled ? "bg-emerald-600 hover:bg-emerald-700" : ""
                          }`}
                        >
                          {ch.isEnabled ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground font-mono text-[11px]">
                        <span>Chat ID: {ch.chatId}</span>
                        {ch.threadId && <span>• Topic ID: {ch.threadId}</span>}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-0.5">
                        <span className={ch.notifyDown ? "text-rose-500 font-medium" : "line-through opacity-50"}>
                          Alert DOWN
                        </span>
                        <span>•</span>
                        <span className={ch.notifyUp ? "text-emerald-500 font-medium" : "line-through opacity-50"}>
                          Alert UP
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onPress={() => handleTest(ch.id)}
                        isDisabled={testingId === ch.id}
                        className="h-8 text-xs gap-1"
                      >
                        <SendIcon className="w-3 h-3" />
                        {testingId === ch.id ? "Mengirim..." : "Test"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onPress={() => handleOpenEdit(ch)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2Icon className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onPress={() => handleDelete(ch.id, ch.name)}
                        className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <Trash2Icon className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmitForm} className="py-4 space-y-4">
            <Field>
              <FieldLabel className="text-xs">Nama Channel / Penerima</FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="misal: Grup NOC Alerting, Channel Insiden Lapangan"
                className="text-xs h-9"
                required
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <Field>
                <FieldLabel className="text-xs">Chat ID / Group ID</FieldLabel>
                <Input
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="misal: -1004338951841"
                  className="text-xs h-9 font-mono"
                  required
                />
              </Field>
            </div>

            <Field>
              <FieldLabel className="text-xs">Message Thread / Topic ID (Opsional)</FieldLabel>
              <Input
                type="number"
                value={threadId}
                onChange={(e) => setThreadId(e.target.value)}
                placeholder="Kosongkan jika bukan supergroup forum topic"
                className="text-xs h-9 font-mono"
              />
            </Field>

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
                  <span>Alert Kejadian DOWN</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded border bg-muted/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyUp}
                    onChange={(e) => setNotifyUp(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <span>Alert Host Pulih (UP)</span>
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
                onPress={() => {
                  setMode("list");
                  resetForm();
                }}
                className="text-xs"
              >
                Batal
              </Button>
              <Button type="submit" size="sm" isDisabled={isSubmitting} className="text-xs">
                {isSubmitting ? "Menyimpan..." : mode === "create" ? "Simpan Channel" : "Perbarui Channel"}
              </Button>
            </div>
          </form>
        )}

        <DialogFooter className="mt-4 pt-3 border-t">
          <Button variant="outline" size="sm" onPress={onClose} className="text-xs">
            Tutup
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
