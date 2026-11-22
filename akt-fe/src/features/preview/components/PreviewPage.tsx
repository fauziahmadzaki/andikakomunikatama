"use client";

import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { previewNavigation } from "@/features/preview/data/preview-navigation";
import { ActionsSection } from "./ActionsSection";
import { DataDisplaySection } from "./DataDisplaySection";
import { FeedbackSection } from "./FeedbackSection";
import { FormsSection } from "./FormsSection";
import { FoundationsSection } from "./FoundationsSection";
import { NavigationSection } from "./NavigationSection";
import { PatternsSection } from "./PatternsSection";
import { TableSection } from "./TableSection";

export function PreviewPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Design system</h1>
            <Badge variant="secondary">Preview</Badge>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Katalog token dan komponen MURANET Internal Systems. Gunakan halaman
            ini untuk memeriksa varian, ukuran, dan state sebelum dipakai di
            modul.
          </p>
          <p className="text-xs text-muted-foreground">
            Gunakan tombol tema di topbar untuk memeriksa tampilan mode gelap.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LinkButton href="/dashboard" variant="outline">
            Kembali ke dashboard
          </LinkButton>
        </div>
      </header>

      <nav
        aria-label="Bagian design system"
        className="sticky top-16 z-20 -mx-4 overflow-x-auto border-y bg-background/95 px-4 py-2 backdrop-blur lg:-mx-6 lg:px-6"
      >
        <ul className="flex min-w-max items-center gap-1">
          {previewNavigation.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="inline-flex h-7 items-center rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-12">
        <FoundationsSection />
        <ActionsSection />
        <FormsSection />
        <DataDisplaySection />
        <TableSection />
        <NavigationSection />
        <FeedbackSection />
        <PatternsSection />
      </div>

      <footer className="border-t pt-4 text-xs text-muted-foreground">
        Token warna, tipografi, radius, dan elevasi bersumber dari{" "}
        <code className="font-mono">src/app/globals.css</code>. Panduan visual
        lengkap ada di <code className="font-mono">DESIGN.md</code>.
      </footer>
    </div>
  );
}
