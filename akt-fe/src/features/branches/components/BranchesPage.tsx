"use client";

import { PlusIcon } from "lucide-react";

import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBranchesPage } from "@/features/branches/hooks/useBranchesPage";
import { BranchConfirmationDialog } from "./BranchConfirmationDialog";
import { BranchDialog } from "./BranchDialog";
import { BranchesTable } from "./BranchesTable";

export function BranchesPage() {
  const {
    branches,
    dialogOpen,
    editingBranch,
    openCreate,
    openEdit,
    closeDialog,
    confirmBranch,
    setConfirmBranch,
    confirmToggle,
    deleteConfirmBranch,
    setDeleteConfirmBranch,
    confirmDelete,
  } = useBranchesPage();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Cabang"
        description="Kelola unit bisnis dan cakupan data operasional."
      >
        <Button onPress={openCreate}>
          <PlusIcon />
          Tambah cabang
        </Button>
      </PageHeader>

      <Card className="gap-0 py-0">
        <CardContent className="p-4">
          <BranchesTable
            branches={branches}
            onEdit={openEdit}
            onToggle={setConfirmBranch}
            onDelete={setDeleteConfirmBranch}
          />
        </CardContent>
      </Card>

      {dialogOpen ? (
        <BranchDialog
          key={editingBranch?.id ?? "new"}
          open={dialogOpen}
          branch={editingBranch}
          onClose={closeDialog}
        />
      ) : null}

      <BranchConfirmationDialog
        branch={confirmBranch}
        onConfirm={confirmToggle}
        onCancel={() => setConfirmBranch(null)}
      />

      <ConfirmationDialog
        open={Boolean(deleteConfirmBranch)}
        title="Hapus cabang?"
        description={`Apakah Anda yakin ingin menghapus cabang ${deleteConfirmBranch?.name} (${deleteConfirmBranch?.code})? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus cabang"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmBranch(null)}
      />
    </div>
  );
}
