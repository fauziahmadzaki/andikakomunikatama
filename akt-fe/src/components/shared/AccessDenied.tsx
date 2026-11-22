"use client";

import { ShieldXIcon } from "lucide-react";

import { LinkButton } from "@/components/ui/button";

export function AccessDenied({
  headingLevel = "h1",
}: {
  headingLevel?: "h1" | "h2";
}) {
  const Heading = headingLevel;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldXIcon className="size-7" />
      </span>
      <div className="space-y-1">
        <Heading className="text-xl font-semibold">Akses ditolak</Heading>
        <p className="text-sm text-muted-foreground">
          Role kamu tidak memiliki izin untuk membuka halaman ini.
        </p>
      </div>
      <LinkButton href="/dashboard">Kembali ke dashboard</LinkButton>
    </div>
  );
}
