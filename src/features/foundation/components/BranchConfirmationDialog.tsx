"use client";

import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import type { Branch } from "@/features/foundation/data/types";

export function BranchConfirmationDialog({
  branch,
  onConfirm,
  onCancel,
}: {
  branch: Branch | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <ConfirmationDialog
      open={Boolean(branch)}
      title={branch?.isActive ? "Nonaktifkan cabang?" : "Aktifkan cabang?"}
      description={
        branch?.isActive
          ? "Cabang yang nonaktif tidak bisa menerima pelanggan baru."
          : "Cabang akan aktif kembali dan bisa menerima pelanggan baru."
      }
      confirmLabel={branch?.isActive ? "Nonaktifkan" : "Aktifkan"}
      destructive={Boolean(branch?.isActive)}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
