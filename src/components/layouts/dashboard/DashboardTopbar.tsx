"use client";

import { useState } from "react";
import {
  BellIcon,
  MenuIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { roleLabels } from "@/features/auth/data/users";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function DashboardTopbar({
  title,
  onMenu,
}: {
  title: string;
  onMenu: () => void;
}) {
  const [dark, setDark] = useState(false);
  const session = useAuthStore((state) => state.session);
  const initials =
    session?.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "AD";

  function toggleTheme() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    setDark(next);
  }

  const themeLabel = dark ? "Aktifkan mode terang" : "Aktifkan mode gelap";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur lg:px-6">
      <TooltipTrigger>
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
        <Tooltip>Buka menu</Tooltip>
      </TooltipTrigger>

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
        <TooltipTrigger>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={themeLabel}
            onPress={toggleTheme}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </Button>
          <Tooltip>{themeLabel}</Tooltip>
        </TooltipTrigger>

        <TooltipTrigger>
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
          <Tooltip>Notifikasi</Tooltip>
        </TooltipTrigger>

        <div className="hidden text-right md:block">
          <p className="text-xs font-medium">{session?.name ?? "Guest"}</p>
          <p className="text-[10px] text-muted-foreground">
            {session ? roleLabels[session.role] : "Belum login"}
          </p>
        </div>

        <div
          title={session?.name ?? "Guest"}
          className="ml-1 flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
