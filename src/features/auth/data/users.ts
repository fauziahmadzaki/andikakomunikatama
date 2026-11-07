export type UserRole = "admin" | "teknisi" | "cs";

export type LocalUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
};

/**
 * User lokal untuk pengembangan.
 * TODO: ganti dengan database/identity provider saat produksi.
 */
export const localUsers: LocalUser[] = [
  {
    id: "usr_admin",
    name: "Administrator",
    email: "admin@muranet.id",
    username: "admin",
    password: "admin123",
    role: "admin",
  },
  {
    id: "usr_teknisi",
    name: "Teknisi NOC",
    email: "teknisi@muranet.id",
    username: "teknisi",
    password: "teknisi123",
    role: "teknisi",
  },
  {
    id: "usr_cs",
    name: "Customer Service",
    email: "cs@muranet.id",
    username: "cs",
    password: "cs123456",
    role: "cs",
  },
];

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

