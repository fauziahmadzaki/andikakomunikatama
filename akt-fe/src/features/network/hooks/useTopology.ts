"use client";

import { useState } from "react";

import { findNearestOdp } from "@/features/network/data/topology";
import { useNetworkStore } from "@/features/network/store/network-store";

export function useTopology() {
  const passiveDevices = useNetworkStore((state) => state.passiveDevices);
  const [form, setForm] = useState({
    latitude: "-6.2",
    longitude: "106.82",
  });
  const [result, setResult] = useState<ReturnType<typeof findNearestOdp> | undefined>(
    undefined
  );

  function search() {
    setResult(
      findNearestOdp(
        passiveDevices,
        Number(form.latitude),
        Number(form.longitude)
      )
    );
  }

  return { passiveDevices, form, setForm, result, search };
}
