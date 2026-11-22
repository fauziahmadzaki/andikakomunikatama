"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPinIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

const MapCanvas = dynamic(
  () => import("./MapCanvas").then((module) => module.MapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 w-full items-center justify-center rounded-lg border text-sm text-muted-foreground">
        Memuat peta…
      </div>
    ),
  }
);

export function LocationPicker({
  latitude,
  longitude,
  onPick,
}: {
  latitude: string;
  longitude: string;
  onPick: (latitude: number, longitude: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const lat = Number(latitude);
  const lng = Number(longitude);
  const hasPoint = Number.isFinite(lat) && Number.isFinite(lng) && latitude !== "" && longitude !== "";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onPress={() => setOpen((value) => !value)}>
          <MapPinIcon />
          {open ? "Tutup peta" : "Pilih di peta"}
        </Button>
        <span className="text-xs text-muted-foreground">
          Klik titik pada peta untuk mengisi koordinat dan wilayah otomatis.
        </span>
      </div>

      {open ? (
        <MapCanvas
          latitude={hasPoint ? lat : undefined}
          longitude={hasPoint ? lng : undefined}
          onSelect={onPick}
        />
      ) : null}
    </div>
  );
}
