import {
  InboxIcon,
  PlusIcon,
  Trash2Icon,
  WifiOffIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AccessDenied } from "@/components/shared/AccessDenied";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useOverlaysPreview } from "@/features/preview/hooks/useOverlaysPreview";
import { PreviewSection } from "./PreviewSection";
import { PreviewSpecimen } from "./PreviewSpecimen";

export function FeedbackSection() {
  const {
    dialogOpen,
    setDialogOpen,
    confirmationOpen,
    setConfirmationOpen,
  } = useOverlaysPreview();

  return (
    <PreviewSection
      id="umpan-balik"
      title="Umpan balik"
      description="Status memuat, keadaan kosong, notifikasi, dan dialog konfirmasi untuk memberi kepastian pada pengguna."
    >
      <PreviewSpecimen
        title="Spinner"
        description="Indikator proses"
      >
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Memuat data
          </div>
          <Spinner className="size-6 text-primary" />
          <Spinner className="size-8 text-primary" />
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Skeleton"
        description="Placeholder saat data dimuat"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Empty state"
        description="Empty · EmptyHeader · EmptyContent"
      >
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon />
            </EmptyMedia>
            <EmptyTitle>Belum ada tagihan</EmptyTitle>
            <EmptyDescription>
              Tagihan akan muncul di sini setelah proses generate dijalankan.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>
              <PlusIcon />
              Generate tagihan
            </Button>
          </EmptyContent>
        </Empty>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Toast"
        description="Notifikasi singkat di kanan atas"
      >
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onPress={() => toast.success("Tagihan berhasil dibuat.")}
          >
            Sukses
          </Button>
          <Button
            variant="outline"
            onPress={() => toast.info("Sinkronisasi dimulai.")}
          >
            Info
          </Button>
          <Button
            variant="outline"
            onPress={() => toast.warning("Koneksi router tidak stabil.")}
          >
            Peringatan
          </Button>
          <Button
            variant="outline"
            onPress={() => toast.error("Gagal menyimpan perubahan.")}
          >
            Error
          </Button>
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Dialog"
        description="Form singkat dalam modal"
      >
        <div className="flex flex-wrap gap-2">
          <Button onPress={() => setDialogOpen(true)}>Buka dialog</Button>
          <Button
            variant="destructive"
            onPress={() => setConfirmationOpen(true)}
          >
            <Trash2Icon />
            Hapus data
          </Button>
        </div>

        <Dialog isOpen={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogHeader>
            <DialogTitle>Ganti paket pelanggan</DialogTitle>
            <DialogDescription>
              Perubahan paket akan berlaku pada siklus tagihan berikutnya.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Paket saat ini</span>
              <span className="font-medium">Home 20 Mbps</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Paket baru</span>
              <span className="font-medium">Home 30 Mbps</span>
            </div>
          </div>
          <DialogFooter>
            <DialogClose variant="outline">Batal</DialogClose>
            <Button
              onPress={() => {
                setDialogOpen(false);
                toast.success("Paket berhasil diubah.");
              }}
            >
              Simpan perubahan
            </Button>
          </DialogFooter>
        </Dialog>

        <ConfirmationDialog
          open={confirmationOpen}
          title="Hapus pelanggan?"
          description="Data pelanggan dan langganan terkait akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
          confirmLabel="Hapus"
          destructive
          onConfirm={() => {
            setConfirmationOpen(false);
            toast.success("Pelanggan berhasil dihapus.");
          }}
          onCancel={() => setConfirmationOpen(false)}
        />
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Keadaan akses ditolak"
        description="AccessDenied untuk role tanpa izin"
        contentClassName="[&>div]:min-h-0"
      >
        <AccessDenied headingLevel="h2" />
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Keadaan gangguan"
        description="Kombinasi ikon, judul, dan aksi"
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <WifiOffIcon className="size-6" />
          </span>
          <div className="space-y-1">
            <p className="font-medium">Koneksi router terputus</p>
            <p className="text-sm text-muted-foreground">
              Periksa kabel dan status perangkat sebelum mencoba lagi.
            </p>
          </div>
          <Button variant="outline">Coba lagi</Button>
        </div>
      </PreviewSpecimen>
    </PreviewSection>
  );
}
