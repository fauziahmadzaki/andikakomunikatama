"use client";

import { useState } from "react";

export function useResetPassword() {
  const [done, setDone] = useState(false);

  function submit() {
    setDone(true);
  }

  return {
    done,
    submit,
  };
}
