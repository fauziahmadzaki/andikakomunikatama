"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { LocalUser, UserRole } from "@/features/users/data/users";
import { useUsersStore } from "@/features/users/store/users-store";
import { useBranchStore } from "@/features/branches/store/branch-store";

type UserForm = {
  name: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  branchId: string;
};

function initialForm(user: LocalUser | null): UserForm {
  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    username: user?.username ?? "",
    password: user?.password ?? "",
    role: user?.role ?? "cs",
    branchId: user?.branchId ?? "br-jkt",
  };
}

export function useUsersDialog({
  user,
  onClose,
}: {
  user: LocalUser | null;
  onClose: () => void;
}) {
  const addUser = useUsersStore((state) => state.addUser);
  const updateUser = useUsersStore((state) => state.updateUser);
  const branches = useBranchStore((state) => state.branches);
  const [form, setForm] = useState<UserForm>(() => initialForm(user));

  function setField<K extends keyof UserForm>(key: K, value: UserForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function save() {
    if (!form.name.trim() || !form.email.trim() || !form.username.trim()) {
      toast.error("Nama, email, dan username wajib diisi.");
      return;
    }

    const branch = branches.find((item) => item.id === form.branchId);
    const payload = {
      name: form.name,
      email: form.email,
      username: form.username,
      password: form.password || "password123",
      role: form.role,
      branchId: form.branchId,
      branchName: branch?.name ?? "Jakarta Pusat",
      twoFactorEnabled: user?.twoFactorEnabled ?? false,
    };

    if (user) {
      updateUser(user.id, payload);
      toast.success("Pengguna diperbarui.");
    } else {
      addUser({ ...payload, status: "active" });
      toast.success("Pengguna ditambahkan.");
    }

    onClose();
  }

  return {
    form,
    setField,
    branches,
    save,
    isEditing: Boolean(user),
  };
}
