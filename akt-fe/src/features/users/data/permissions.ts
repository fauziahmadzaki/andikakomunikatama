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
  { code: "invoice.read", label: "Lihat tagihan", module: "Billing" },
  { code: "invoice.generate", label: "Generate tagihan", module: "Billing" },
  { code: "invoice.void", label: "Void tagihan", module: "Billing" },
  { code: "payment.read", label: "Lihat pembayaran", module: "Billing" },
  { code: "payment.create", label: "Catat pembayaran", module: "Billing" },
  { code: "payment.verify", label: "Verifikasi pembayaran", module: "Billing" },
  { code: "plan.read", label: "Lihat paket", module: "Katalog" },
  { code: "plan.create", label: "Tambah paket", module: "Katalog" },
  { code: "plan.update", label: "Ubah paket", module: "Katalog" },
  { code: "plan_price.manage", label: "Kelola harga paket", module: "Katalog" },
  { code: "plan_branch.manage", label: "Kelola ketersediaan paket", module: "Katalog" },
  { code: "discount.read", label: "Lihat diskon", module: "Katalog" },
  { code: "discount.create", label: "Tambah diskon", module: "Katalog" },
  { code: "discount.update", label: "Ubah diskon", module: "Katalog" },
  { code: "subscription.read", label: "Lihat langganan", module: "Langganan" },
  { code: "subscription.create", label: "Buat langganan", module: "Langganan" },
  { code: "subscription.update", label: "Ubah langganan", module: "Langganan" },
  { code: "subscription.activate", label: "Aktifkan langganan", module: "Langganan" },
  { code: "subscription.suspend", label: "Isolir langganan", module: "Langganan" },
  { code: "subscription.terminate", label: "Terminasi langganan", module: "Langganan" },
  { code: "subscription.migrate", label: "Migrasi langganan", module: "Langganan" },
  { code: "service.read", label: "Lihat service", module: "Langganan" },
  { code: "service.provision", label: "Provision service", module: "Langganan" },
  { code: "service.suspend", label: "Suspend service", module: "Langganan" },
  { code: "service.terminate", label: "Terminasi service", module: "Langganan" },
  { code: "network.read", label: "Lihat jaringan", module: "Jaringan" },
  { code: "network.manage", label: "Kelola jaringan", module: "Jaringan" },
  { code: "credential.rotate", label: "Rotasi credential", module: "Jaringan" },
  { code: "inventory.read", label: "Lihat inventaris", module: "Jaringan" },
  { code: "inventory.manage", label: "Kelola inventaris", module: "Jaringan" },
  { code: "inventory.move", label: "Movement inventaris", module: "Jaringan" },
  { code: "topology.manage", label: "Kelola topologi", module: "Jaringan" },
  { code: "finance.read", label: "Lihat keuangan", module: "Keuangan" },
  { code: "finance.manage", label: "Kelola keuangan", module: "Keuangan" },
  { code: "report.view", label: "Lihat laporan", module: "Laporan" },
  { code: "report.export", label: "Export laporan", module: "Laporan" },
  { code: "notification.read", label: "Lihat notifikasi", module: "Notifikasi" },
  { code: "notification.manage", label: "Kelola notifikasi", module: "Notifikasi" },
  { code: "integration.read", label: "Lihat integrasi", module: "Integrasi" },
  { code: "integration.manage", label: "Kelola integrasi", module: "Integrasi" },
  { code: "migration.read", label: "Lihat migrasi", module: "Migrasi" },
  { code: "migration.manage", label: "Kelola migrasi", module: "Migrasi" },
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
  "invoice.read",
  "payment.read",
  "payment.create",
  "plan.read",
  "discount.read",
  "subscription.read",
  "subscription.create",
  "subscription.activate",
  "subscription.suspend",
  "service.read",
  "branch.read",
  "ticket.read",
  "ticket.create",
  "report.view",
  "notification.read",
];

const teknisiPermissions = [
  "customer.read",
  "plan.read",
  "subscription.read",
  "service.read",
  "service.provision",
  "network.read",
  "network.manage",
  "inventory.read",
  "inventory.move",
  "credential.rotate",
  "ticket.read",
  "ticket.assign",
  "ticket.close",
  "branch.read",
  "report.view",
  "notification.read",
  "integration.read",
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
  // Admin selalu bypass permission dan bisa mengakses semua menu.
  if (role === "admin") {
    return true;
  }

  return rolePermissions[role]?.includes(code) ?? false;
}
