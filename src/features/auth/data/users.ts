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

export type Session = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  branchId: string;
  branchName: string;
};

export const localUsers: LocalUser[] = [
  {
    id: "usr-admin",
    name: "Administrator",
    email: "admin@muranet.id",
    username: "admin",
    password: "admin123",
    role: "admin",
    branchId: "br-jkt",
    branchName: "Jakarta Pusat",
    status: "active",
    lastLoginAt: "2026-11-07T08:00:00+07:00",
    twoFactorEnabled: true,
  },
  {
    id: "usr-cs",
    name: "Customer Service",
    email: "cs@muranet.id",
    username: "cs",
    password: "cs123456",
    role: "cs",
    branchId: "br-jkt",
    branchName: "Jakarta Pusat",
    status: "active",
    lastLoginAt: "2026-11-07T08:12:00+07:00",
    twoFactorEnabled: false,
  },
  {
    id: "usr-teknisi",
    name: "Teknisi NOC",
    email: "teknisi@muranet.id",
    username: "teknisi",
    password: "teknisi123",
    role: "teknisi",
    branchId: "br-bdg",
    branchName: "Bandung",
    status: "active",
    lastLoginAt: "2026-11-06T16:40:00+07:00",
    twoFactorEnabled: false,
  },
  {
    id: "usr-rina",
    name: "Rina Sales",
    email: "rina@muranet.id",
    username: "rina",
    password: "rina12345",
    role: "cs",
    branchId: "br-jkt",
    branchName: "Jakarta Pusat",
    status: "active",
    lastLoginAt: "2026-11-06T15:22:00+07:00",
    twoFactorEnabled: false,
  },
  {
    id: "usr-bayu",
    name: "Bayu Pratama",
    email: "bayu@muranet.id",
    username: "bayu",
    password: "bayu12345",
    role: "cs",
    branchId: "br-sby",
    branchName: "Surabaya",
    status: "inactive",
    lastLoginAt: "2026-10-28T09:10:00+07:00",
    twoFactorEnabled: false,
  },
  {
    id: "usr-dewi",
    name: "Dewi Lestari",
    email: "dewi@muranet.id",
    username: "dewi",
    password: "dewi12345",
    role: "admin",
    branchId: "br-bdg",
    branchName: "Bandung",
    status: "active",
    lastLoginAt: "2026-11-07T07:45:00+07:00",
    twoFactorEnabled: true,
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
