"use client";

import { useState } from "react";

export function useFormsPreview() {
  const [plan, setPlan] = useState("home-20");
  const [branch, setBranch] = useState("all");

  return {
    plan,
    setPlan,
    branch,
    setBranch,
  };
}
