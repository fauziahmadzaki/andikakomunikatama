"use client";

import { useState } from "react";

export function useOverlaysPreview() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  return {
    dialogOpen,
    setDialogOpen,
    confirmationOpen,
    setConfirmationOpen,
  };
}
