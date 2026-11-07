import type { UserRole } from "./users";

export type Permission = {
  code: string;
  label: string;
  module: string;
};

export const permissions: Permission[] = [
  { code: "customer.read", label: "Lihat pelanggan", module: "Pelanggan" },
  { code: "customer.create", label: "Tambah pelanggan", module: "Pelanggan" },
  { code: "customer.update", label: "Ubah pelanggan", module: "Pelanggan" },
  { code: "customer.deactivate", label: "Nonaktifkan pelanggan", module: "Pelanggan" },
  { code: "customer.import", label: "Import pelanggan", module: "Pelanggan" },
  { code: "customer.export", label: "Export pelanggan", module: "Pelanggan" },
  { code: "customer.segment.manage", label: "Kelola segmen", module: "Pelanggan" },
  { code: "invoice.read", label: "Lihat tagihan", module: "Billing" },
  { code: "invoice.generate", label: "Generate tagihan", module: "Billing" },
  { code: "invoice.void", label: "Void tagihan", module: "Billing" },
  { code: "payment.read", label: "Lihat pembayaran", module: "Billing" },
  { code: "payment.create", label: "Catat pembayaran", module: "Billing" },
  { code: "payment.verify", label: "Verifikasi pembayaran", module: "Billing" },
  { code: "network.read", label: "Lihat jaringan", module: "Jaringan" },
  { code: "network.manage", label: "Kelola jaringan", module: "Jaringan" },
  { code: "ticket.read", label: "Lihat tiket", module: "Layanan" },
  { code: "ticket.create", label: "Buat tiket", module: "Layanan" },
  { code: "ticket.assign", label: "Assign tiket", module: "Layanan" },
  { code: "ticket.close", label: "Tutup tiket", module: "Layanan" },
  { code: "company.read", label: "Lihat profil perusahaan", module: "Pengaturan" },
  { code: "company.update", label: "Ubah profil perusahaan", module: "Pengaturan" },
  { code: "branch.read", label: "Lihat cabang", module: "Pengaturan" },
  { code: "branch.manage", label: "Kelola cabang", module: "Pengaturan" },
  { code: "user.read", label: "Lihat pengguna", module: "Pengaturan" },
  { code: "user.manage", label: "Kelola pengguna", module: "Pengaturan" },
  { code: "role.manage", label: "Kelola role & akses", module: "Pengaturan" },
  { code: "audit.read", label: "Lihat audit log", module: "Pengaturan" },
  { code: "access.review", label: "Access review", module: "Pengaturan" },
  { code: "setting.read", label: "Lihat pengaturan", module: "Pengaturan" },
  { code: "setting.update", label: "Ubah pengaturan", module: "Pengaturan" },
  { code: "sequence.read", label: "Lihat penomoran", module: "Pengaturan" },
  { code: "sequence.manage", label: "Kelola penomoran", module: "Pengaturan" },
  { code: "security.manage", label: "Kelola keamanan", module: "Pengaturan" },
];

export const allPermissionCodes = permissions.map((permission) => permission.code);

const csPermissions = [
  "customer.read",
  "customer.create",
  "customer.update",
  "customer.import",
  "customer.export",
  "customer.segment.manage",
  "invoice.read",
  "payment.read",
  "payment.create",
  "branch.read",
  "ticket.read",
  "ticket.create",
];

const teknisiPermissions = [
  "customer.read",
  "network.read",
  "ticket.read",
  "ticket.assign",
  "ticket.close",
  "branch.read",
];

export const defaultRolePermissions: Record<UserRole, string[]> = {
  admin: allPermissionCodes,
  cs: csPermissions,
  teknisi: teknisiPermissions,
};

export function hasPermission(
  role: UserRole,
  code: string,
  rolePermissions: Record<UserRole, string[]>
) {
  return rolePermissions[role]?.includes(code) ?? false;
}
