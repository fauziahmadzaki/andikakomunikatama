"use client";

import { useState } from "react";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function submit() {
    setSent(true);
  }

  return {
    email,
    setEmail,
    sent,
    submit,
  };
}
