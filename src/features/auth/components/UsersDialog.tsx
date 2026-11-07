"use client";

import { SelectField } from "@/components/shared/SelectField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { LocalUser, UserRole } from "@/features/auth/data/users";
import { useUsersDialog } from "@/features/auth/hooks/useUsersDialog";

export function UsersDialog({
  open,
  user,
  onClose,
}: {
  open: boolean;
  user: LocalUser | null;
  onClose: () => void;
}) {
  const { form, setField, branches, save, isEditing } = useUsersDialog({
    user,
    onClose,
  });

  return (
    <Dialog isOpen={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit pengguna" : "Tambah pengguna"}</DialogTitle>
        <DialogDescription>Role menentukan menu dan akses data.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <Field>
          <FieldLabel htmlFor="user-name">Nama lengkap</FieldLabel>
          <Input
            id="user-name"
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="user-email">Email</FieldLabel>
            <Input
              id="user-email"
              type="email"
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="user-username">Username</FieldLabel>
            <Input
              id="user-username"
              value={form.username}
              onChange={(event) => setField("username", event.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Role</p>
            <SelectField
              value={form.role}
              onValueChange={(value) => setField("role", value as UserRole)}
              ariaLabel="Role pengguna"
              options={[
                { value: "admin", label: "Admin" },
                { value: "cs", label: "Customer Service" },
                { value: "teknisi", label: "Teknisi" },
              ]}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Cabang</p>
            <SelectField
              value={form.branchId}
              onValueChange={(value) => setField("branchId", value)}
              ariaLabel="Cabang pengguna"
              options={branches.map((branch) => ({
                value: branch.id,
                label: branch.name,
              }))}
            />
          </div>
        </div>

        {!isEditing ? (
          <Field>
            <FieldLabel htmlFor="user-password">Password awal</FieldLabel>
            <Input
              id="user-password"
              type="password"
              placeholder="Minimal 12 karakter"
              value={form.password}
              onChange={(event) => setField("password", event.target.value)}
            />
          </Field>
        ) : null}
      </div>

      <DialogFooter>
        <Button variant="outline" onPress={onClose}>
          Batal
        </Button>
        <Button onPress={save}>Simpan</Button>
      </DialogFooter>
    </Dialog>
  );
}
