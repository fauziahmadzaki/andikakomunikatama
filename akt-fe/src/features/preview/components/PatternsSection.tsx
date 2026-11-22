import { PlusIcon, UsersIcon, WifiIcon } from "lucide-react";

import { BrandMark } from "@/components/layouts/dashboard/BrandMark";
import { SidebarNavLink } from "@/components/layouts/dashboard/SidebarNavLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { PreviewSection } from "./PreviewSection";
import { PreviewSpecimen } from "./PreviewSpecimen";

export function PatternsSection() {
  return (
    <PreviewSection
      id="pola"
      title="Pola halaman"
      description="Komposisi yang dipakai berulang di halaman internal: header halaman, brand mark, dan item navigasi sidebar."
    >
      <PreviewSpecimen
        title="PageHeader"
        description="Judul, deskripsi, dan aksi halaman"
      >
        <PageHeader
          headingLevel="h2"
          title="Data pelanggan"
          description="Kelola data pelanggan, status layanan, dan riwayat langganan."
        >
          <Button variant="outline">
            <WifiIcon />
            Cek jaringan
          </Button>
          <Button>
            <PlusIcon />
            Tambah pelanggan
          </Button>
        </PageHeader>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Brand mark"
        description="Logo dan wordmark MURANET"
      >
        <div className="flex flex-wrap items-center gap-6 rounded-xl border bg-background p-4">
          <BrandMark />
          <BrandMark collapsed />
        </div>
      </PreviewSpecimen>

      <PreviewSpecimen
        title="Sidebar nav item"
        description="State aktif, nonaktif, dan item anak"
      >
        <nav
          aria-label="Contoh navigasi sidebar"
          className="w-full max-w-xs space-y-1 rounded-xl border bg-background p-4"
        >
          <SidebarNavLink
            href="/dashboard"
            title="Dashboard"
            icon={UsersIcon}
            active
          />
          <SidebarNavLink
            href="/dashboard/pelanggan"
            title="Data pelanggan"
            icon={UsersIcon}
            active={false}
          />
          <SidebarNavLink
            href="/dashboard/jaringan"
            title="Jaringan"
            icon={WifiIcon}
            active={false}
          />
          <SidebarNavLink
            href="/dashboard/pelanggan/tagihan"
            title="Tagihan"
            active={false}
            child
          />
        </nav>
      </PreviewSpecimen>
    </PreviewSection>
  );
}
