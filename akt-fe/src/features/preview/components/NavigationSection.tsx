import {
  ChevronDownIcon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { PreviewSection } from "./PreviewSection";
import { PreviewSpecimen } from "./PreviewSpecimen";

export function NavigationSection() {
  return (
    <PreviewSection
      id="navigasi"
      title="Navigasi"
      description="Tabs untuk memisahkan konten, dropdown untuk kumpulan aksi, dan tooltip untuk memperjelas tombol ikon."
    >
      <PreviewSpecimen
        title="Tabs"
        description="Varian default dan line"
      >
        <div className="space-y-6">
          <Tabs defaultSelectedKey="ringkasan" className="space-y-3">
            <TabsList>
              <TabsTrigger id="ringkasan">Ringkasan</TabsTrigger>
              <TabsTrigger id="tagihan">Tagihan</TabsTrigger>
              <TabsTrigger id="riwayat">Riwayat</TabsTrigger>
            </TabsList>
            <TabsContent id="ringkasan" className="rounded-lg border p-4">
              Ringkasan langganan, paket aktif, dan status pembayaran.
            </TabsContent>
            <TabsContent id="tagihan" className="rounded-lg border p-4">
              Daftar tagihan yang belum dibayar dan riwayat pembayaran.
            </TabsContent>
            <TabsContent id="riwayat" className="rounded-lg border p-4">
              Riwayat perubahan paket dan mutasi layanan.
            </TabsContent>
          </Tabs>

          <Tabs defaultSelectedKey="aktif" className="space-y-3">
            <TabsList variant="line">
              <TabsTrigger id="aktif">Aktif</TabsTrigger>
              <TabsTrigger id="isolir">Isolir</TabsTrigger>
              <TabsTrigger id="nonaktif">Nonaktif</TabsTrigger>
            </TabsList>
            <TabsContent id="aktif" className="text-sm text-muted-foreground">
              Menampilkan pelanggan yang layanannya aktif.
            </TabsContent>
            <TabsContent id="isolir" className="text-sm text-muted-foreground">
              Menampilkan pelanggan yang diisolir karena tunggakan.
            </TabsContent>
            <TabsContent id="nonaktif" className="text-sm text-muted-foreground">
              Menampilkan pelanggan yang sudah berhenti berlangganan.
            </TabsContent>
          </Tabs>
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Dropdown menu"
        description="Grup · shortcut · aksi destruktif"
      >
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenuTrigger>
            <Button variant="outline">
              Aksi pelanggan
              <ChevronDownIcon />
            </Button>
            <DropdownMenu>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Aksi pelanggan</DropdownMenuLabel>
                <DropdownMenuItem textValue="Lihat detail" onAction={() => undefined}>
                  <EyeIcon />
                  Lihat detail
                </DropdownMenuItem>
                <DropdownMenuItem textValue="Ubah data" onAction={() => undefined}>
                  <PencilIcon />
                  Ubah data
                  <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem textValue="Ekspor data" onAction={() => undefined}>
                  <DownloadIcon />
                  Ekspor data
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                textValue="Hapus pelanggan"
                variant="destructive"
                onAction={() => undefined}
              >
                <Trash2Icon />
                Hapus pelanggan
              </DropdownMenuItem>
            </DropdownMenu>
          </DropdownMenuTrigger>

          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" aria-label="Menu lainnya">
              <ChevronDownIcon />
            </Button>
            <DropdownMenu>
              <DropdownMenuItem onAction={() => undefined}>
                Tandai sudah dibaca
              </DropdownMenuItem>
              <DropdownMenuItem onAction={() => undefined}>
                Arsipkan
              </DropdownMenuItem>
            </DropdownMenu>
          </DropdownMenuTrigger>
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Tooltip"
        description="Wajib untuk setiap tombol ikon"
      >
        <div className="flex flex-wrap items-center gap-2">
          <TooltipTrigger>
            <Button variant="outline" size="icon" aria-label="Salin ID pelanggan">
              <CopyIcon />
            </Button>
            <Tooltip>Salin ID pelanggan</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger>
            <Button variant="outline" size="icon" aria-label="Unduh laporan">
              <DownloadIcon />
            </Button>
            <Tooltip>Unduh laporan</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger>
            <Button variant="ghost" size="icon-sm" aria-label="Ubah data">
              <PencilIcon />
            </Button>
            <Tooltip placement="bottom">Ubah data</Tooltip>
          </TooltipTrigger>
        </div>
      </PreviewSpecimen>
    </PreviewSection>
  );
}
