"use client";

import { useEffect, useState } from "react";
import {
  BellIcon,
  MenuIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DashboardTopbar({
  title,
  onMenu,
}: {
  title: string;
  onMenu: () => void;
}) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    setDark(next);
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur lg:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Buka menu"
        onPress={onMenu}
      >
        <MenuIcon />
      </Button>

      <p className="text-sm font-semibold sm:hidden">{title}</p>

      <div className="relative hidden w-full max-w-sm sm:block">
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          placeholder="Cari apa saja…"
          className="h-9 rounded-lg border-transparent bg-muted/60 pr-14 pl-9"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:block">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={dark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
          onPress={toggleTheme}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Notifikasi"
          className="relative"
        >
          <BellIcon />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive" />
        </Button>

        <div
          title="Administrator"
          className="ml-1 flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
        >
          AD
        </div>
      </div>
    </header>
  );
}
