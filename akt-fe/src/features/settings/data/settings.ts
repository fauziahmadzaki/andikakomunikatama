export type SettingFieldType = "text" | "number" | "boolean" | "select";

export type SettingField = {
  key: string;
  label: string;
  description: string;
  type: SettingFieldType;
  value: string | number | boolean;
  options?: string[];
  suffix?: string;
};

export type SettingGroup = {
  id: string;
  title: string;
  description: string;
  fields: SettingField[];
};

export const seedSettings: SettingGroup[] = [
  {
    id: "billing",
    title: "Billing",
    description: "Aturan penagihan dan pajak.",
    fields: [
      {
        key: "tax_rate",
        label: "Tarif PPN",
        description: "Persentase PPN yang dipakai saat membuat invoice.",
        type: "number",
        value: 11,
        suffix: "%",
      },
      {
        key: "default_due_day",
        label: "Jatuh tempo default",
        description: "Tanggal jatuh tempo default untuk pelanggan baru.",
        type: "number",
        value: 10,
        suffix: "hari",
      },
      {
        key: "grace_period",
        label: "Masa tenggang isolir",
        description: "Jumlah hari setelah jatuh tempo sebelum isolir otomatis.",
        type: "number",
        value: 3,
        suffix: "hari",
      },
      {
        key: "auto_suspend",
        label: "Isolir otomatis",
        description: "Aktifkan penjadwalan isolir otomatis.",
        type: "boolean",
        value: true,
      },
    ],
  },
  {
    id: "notification",
    title: "Notifikasi",
    description: "Preferensi pengiriman pesan.",
    fields: [
      {
        key: "wa_device",
        label: "Device WhatsApp",
        description: "Device utama untuk pengiriman pesan.",
        type: "select",
        value: "NOC-01",
        options: ["NOC-01", "CS-01", "Billing-01"],
      },
      {
        key: "quiet_start",
        label: "Jam tenang mulai",
        description: "Pesan non-darurat tidak dikirim setelah jam ini.",
        type: "select",
        value: "21:00",
        options: ["20:00", "21:00", "22:00"],
      },
      {
        key: "quiet_end",
        label: "Jam tenang selesai",
        description: "Pesan non-darurat dikirim kembali setelah jam ini.",
        type: "select",
        value: "07:00",
        options: ["06:00", "07:00", "08:00"],
      },
      {
        key: "email_invoice",
        label: "Kirim invoice via email",
        description: "Lampirkan invoice PDF pada email pelanggan.",
        type: "boolean",
        value: true,
      },
    ],
  },
  {
    id: "security",
    title: "Keamanan",
    description: "Kebijakan sesi dan akses.",
    fields: [
      {
        key: "idle_timeout",
        label: "Idle timeout",
        description: "Sesi berakhir setelah tidak aktif selama ini.",
        type: "number",
        value: 60,
        suffix: "menit",
      },
      {
        key: "max_login_attempt",
        label: "Maksimal percobaan login",
        description: "Jumlah percobaan sebelum akun dikunci sementara.",
        type: "number",
        value: 5,
        suffix: "kali",
      },
      {
        key: "two_factor_roles",
        label: "2FA wajib untuk",
        description: "Role yang wajib memakai 2FA.",
        type: "select",
        value: "Admin",
        options: ["Admin", "Admin & Finance", "Semua staff"],
      },
    ],
  },
  {
    id: "operations",
    title: "Operasional",
    description: "Batas dan perilaku sistem.",
    fields: [
      {
        key: "max_upload_mb",
        label: "Ukuran upload maksimal",
        description: "Batas ukuran file lampiran.",
        type: "number",
        value: 5,
        suffix: "MB",
      },
      {
        key: "import_max_rows",
        label: "Maksimal baris import",
        description: "Jumlah baris per batch import pelanggan.",
        type: "number",
        value: 5000,
        suffix: "baris",
      },
    ],
  },
];
