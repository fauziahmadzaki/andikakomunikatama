export type UserRole = "admin" | "teknisi" | "cs";

export type UserStatus = "active" | "inactive";

export type LocalUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  branchId: string;
  branchName: string;
  status: UserStatus;
  lastLoginAt: string | null;
  twoFactorEnabled: boolean;
};

export const localUsers: LocalUser[] = [];

export const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  teknisi: "Teknisi",
  cs: "Customer Service",
};

export const roleDescriptions: Record<UserRole, string> = {
  admin: "Kelola pengguna, role, dan konfigurasi sistem.",
  teknisi: "Pantau jaringan dan tangani gangguan pelanggan.",
  cs: "Layani pendaftaran, tagihan, dan tiket pelanggan.",
};

export function findLocalUser(
  identifier: string,
  password: string
): LocalUser | undefined {
  const normalized = identifier.trim().toLowerCase();

  return localUsers.find(
    (user) =>
      (user.email.toLowerCase() === normalized ||
        user.username.toLowerCase() === normalized) &&
      user.password === password
  );
}
