import {
  CheckIcon,
  DownloadIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";

import { ActionIconButton } from "@/components/shared/ActionIconButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PreviewRow } from "./PreviewRow";
import { PreviewSection } from "./PreviewSection";
import { PreviewSpecimen } from "./PreviewSpecimen";

export function ActionsSection() {
  return (
    <PreviewSection
      id="aksi"
      title="Aksi"
      description="Tombol, badge, status, dan aksi ikon. Gunakan varian destruktif hanya untuk aksi yang menghapus atau membatalkan data."
    >
      <PreviewSpecimen title="Button" description="6 varian · 5 ukuran">
        <div className="space-y-4">
          <PreviewRow label="Varian">
            <Button>Default</Button>
            <Button variant="secondary">Sekunder</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destruktif</Button>
            <Button variant="link">Tautan</Button>
          </PreviewRow>

          <PreviewRow label="Ukuran">
            <Button size="xs">Extra small</Button>
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
          </PreviewRow>

          <PreviewRow label="Dengan ikon">
            <Button>
              <PlusIcon />
              Tambah pelanggan
            </Button>
            <Button variant="outline">
              <DownloadIcon />
              Ekspor
            </Button>
            <Button variant="secondary">
              <SaveIcon />
              Simpan
            </Button>
          </PreviewRow>

          <PreviewRow label="Ikon saja">
            <Button size="icon" aria-label="Tambah">
              <PlusIcon />
            </Button>
            <Button size="icon-sm" variant="outline" aria-label="Lihat">
              <EyeIcon />
            </Button>
            <Button size="icon-lg" variant="ghost" aria-label="Hapus" className="text-destructive">
              <Trash2Icon />
            </Button>
          </PreviewRow>

          <PreviewRow label="Nonaktif">
            <Button isDisabled>Aksi nonaktif</Button>
            <Button variant="outline" isDisabled>
              <PencilIcon />
              Ubah
            </Button>
            <Button isDisabled>
              <Spinner />
              Menyimpan…
            </Button>
          </PreviewRow>

          <PreviewRow label="Tautan">
            <LinkButton href="/dashboard" variant="outline">
              Buka dashboard
            </LinkButton>
            <LinkButton href="/preview" variant="link">
              Muat ulang preview
            </LinkButton>
          </PreviewRow>
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen title="Badge" description="6 varian">
        <div className="space-y-4">
          <PreviewRow label="Varian">
            <Badge>Default</Badge>
            <Badge variant="secondary">Sekunder</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="ghost">Ghost</Badge>
            <Badge variant="destructive">Destruktif</Badge>
            <Badge variant="link">Tautan</Badge>
          </PreviewRow>
          <PreviewRow label="Dengan ikon">
            <Badge variant="secondary">
              <CheckIcon />
              Terverifikasi
            </Badge>
            <Badge variant="outline">12 perangkat</Badge>
          </PreviewRow>
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Status badge"
        description="Pemetaan status operasional"
      >
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="primary">Diproses</StatusBadge>
          <StatusBadge tone="success">Aktif</StatusBadge>
          <StatusBadge tone="warning">Isolir</StatusBadge>
          <StatusBadge tone="danger">Gagal</StatusBadge>
          <StatusBadge tone="neutral">Draft</StatusBadge>
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Action icon button"
        description="Wajib memiliki label aksesibel dan tooltip"
      >
        <div className="flex flex-wrap items-center gap-1">
          <ActionIconButton
            icon={EyeIcon}
            label="Lihat detail"
            onPress={() => undefined}
          />
          <ActionIconButton
            icon={PencilIcon}
            label="Ubah data"
            onPress={() => undefined}
          />
          <ActionIconButton
            icon={Trash2Icon}
            label="Hapus data"
            tone="destructive"
            onPress={() => undefined}
          />
          <ActionIconButton
            icon={DownloadIcon}
            label="Unduh berkas"
            isDisabled
            onPress={() => undefined}
          />
        </div>
      </PreviewSpecimen>
    </PreviewSection>
  );
}
