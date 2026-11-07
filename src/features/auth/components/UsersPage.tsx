"use client";

import { SearchIcon, UserPlusIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUsersPage } from "@/features/auth/hooks/useUsersPage";
import { UserConfirmationDialog } from "./UserConfirmationDialog";
import { UsersDialog } from "./UsersDialog";
import { UsersTable } from "./UsersTable";

export function UsersPage() {
  const {
    query,
    setQuery,
    filteredUsers,
    dialogOpen,
    editingUser,
    openCreate,
    openEdit,
    closeDialog,
    confirmUser,
    setConfirmUser,
    confirmToggle,
  } = useUsersPage();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Pengguna"
        description="Kelola akses staff, role, dan cakupan cabang."
      >
        <Button onPress={openCreate}>
          <UserPlusIcon />
          Tambah pengguna
        </Button>
      </PageHeader>

      <Card className="gap-0 py-0">
        <CardContent className="space-y-4 p-4">
          <div className="relative w-full sm:max-w-sm">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama, email, atau username…"
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <UsersTable
            users={filteredUsers}
            onEdit={openEdit}
            onToggle={setConfirmUser}
          />
        </CardContent>
      </Card>

      {dialogOpen ? (
        <UsersDialog
          key={editingUser?.id ?? "new"}
          open={dialogOpen}
          user={editingUser}
          onClose={closeDialog}
        />
      ) : null}

      <UserConfirmationDialog
        user={confirmUser}
        onConfirm={confirmToggle}
        onCancel={() => setConfirmUser(null)}
      />
    </div>
  );
}
