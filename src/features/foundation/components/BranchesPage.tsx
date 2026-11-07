"use client";

import { PlusIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBranchesPage } from "@/features/foundation/hooks/useBranchesPage";
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
    </div>
  );
}
