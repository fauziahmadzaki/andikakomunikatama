import type { PassiveDevice } from "./types";

const EARTH_RADIUS_KM = 6371;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestOdp(
  devices: PassiveDevice[],
  latitude: number,
  longitude: number
) {
  return devices
    .filter((device) => device.type === "odp")
    .map((device) => ({
      device,
      distance: distanceKm(latitude, longitude, device.latitude, device.longitude),
      available: device.capacity - device.usedCapacity,
    }))
    .filter((item) => item.available > 0)
    .sort((a, b) => a.distance - b.distance)[0];
}
