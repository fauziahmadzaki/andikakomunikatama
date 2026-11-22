"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, TerminalIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { MonitoringTarget } from "../types";

export function NetwatchScriptDialog({
  target,
  open,
  onClose,
}: {
  target: MonitoringTarget | null;
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!target) return null;

  const cliCommand = target.netwatchCli || "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cliCommand);
      setCopied(true);
      toast.success("Script Netwatch berhasil disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin script.");
    }
  };

  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <div className="space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <TerminalIcon className="size-5 text-primary" />
            <DialogTitle>Script Netwatch MikroTik</DialogTitle>
          </div>
          <DialogDescription>
            Script ini dieksekusi di router MikroTik untuk memantau host{" "}
            <strong>{target.name}</strong> ({target.host}) dan memanggil webhook sistem saat UP atau DOWN.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-xs text-muted-foreground">
            Buka <strong>Terminal Winbox</strong> atau SSH di router, lalu tempel script berikut:
          </p>
          <div className="relative rounded-lg border bg-zinc-950 p-4 font-mono text-xs text-zinc-100 shadow-inner overflow-x-auto">
            <pre className="whitespace-pre-wrap break-all">{cliCommand}</pre>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">💡 Cara Kerja:</p>
            <p>
              • Rule Netwatch memantau ICMP host setiap <strong>{target.intervalSeconds}s</strong> dengan timeout <strong>{target.timeoutMs}ms</strong>.
            </p>
            <p>
              • Saat host padam, MikroTik menjalankan <code>/tool fetch</code> ke webhook backend (mencatat downtime & insiden).
            </p>
            <p>
              • Saat host pulih kembali, MikroTik memanggil webhook UP (menyelesaikan insiden downtime secara otomatis).
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onPress={onClose}>
            Tutup
          </Button>
          <Button onPress={handleCopy} className="gap-1.5">
            {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
            {copied ? "Tersalin!" : "Salin Script CLI"}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
