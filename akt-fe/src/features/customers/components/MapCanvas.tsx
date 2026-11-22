"use client";

import { useEffect, useRef } from "react";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [-6.2, 106.816];

const markerIcon = L.divIcon({
  className: "",
  html: '<span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:9999px;background:var(--primary);box-shadow:0 0 0 4px color-mix(in srgb, var(--primary) 25%, transparent);"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function MapCanvas({
  latitude,
  longitude,
  onSelect,
}: {
  latitude?: number;
  longitude?: number;
  onSelect: (latitude: number, longitude: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const hasPoint =
      typeof latitude === "number" && typeof longitude === "number";
    const initialCenter: [number, number] = hasPoint
      ? [latitude as number, longitude as number]
      : DEFAULT_CENTER;
    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: hasPoint ? 15 : 5,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    if (typeof latitude === "number" && typeof longitude === "number") {
      markerRef.current = L.marker([latitude, longitude], {
        icon: markerIcon,
      }).addTo(map);
    }

    map.on("click", (event: L.LeafletMouseEvent) => {
      const nextLatitude = Number(event.latlng.lat.toFixed(6));
      const nextLongitude = Number(event.latlng.lng.toFixed(6));

      if (markerRef.current) {
        markerRef.current.setLatLng([nextLatitude, nextLongitude]);
      } else {
        markerRef.current = L.marker([nextLatitude, nextLongitude], {
          icon: markerIcon,
        }).addTo(map);
      }

      onSelectRef.current(nextLatitude, nextLongitude);
    });

    mapRef.current = map;

    const resizeFrame = requestAnimationFrame(() => map.invalidateSize());

    return () => {
      cancelAnimationFrame(resizeFrame);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Only initialize once; coordinate updates are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (
      !map ||
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      return;
    }

    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
    } else {
      markerRef.current = L.marker([latitude, longitude], {
        icon: markerIcon,
      }).addTo(map);
    }
    map.setView([latitude, longitude], Math.max(map.getZoom(), 14));
  }, [latitude, longitude]);

  return (
    <div
      ref={containerRef}
      className="h-64 w-full overflow-hidden rounded-lg border"
      role="application"
      aria-label="Peta pemilihan lokasi"
    />
  );
}
