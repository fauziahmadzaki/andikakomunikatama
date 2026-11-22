import type { MigrationStep } from "./types";

export const seedSteps: MigrationStep[] = [
  {
    id: "mig-01",
    title: "Extract legacy data",
    description: "Export tabel dan file dari sistem lama.",
    status: "completed",
    count: 344,
  },
  {
    id: "mig-02",
    title: "Mapping & cleaning",
    description: "Normalisasi phone, NIK, role, dan enum.",
    status: "completed",
    count: 12844,
  },
  {
    id: "mig-03",
    title: "Dry run",
    description: "Validasi staging tanpa menulis produksi.",
    status: "pending",
  },
  {
    id: "mig-04",
    title: "Financial reconciliation",
    description: "Cocokkan invoice, payment, dan outstanding.",
    status: "pending",
  },
  {
    id: "mig-05",
    title: "Dual-run",
    description: "Jalankan sistem baru paralel satu siklus billing.",
    status: "pending",
  },
  {
    id: "mig-06",
    title: "Cutover",
    description: "Aktifkan sistem baru dan legacy read-only.",
    status: "pending",
  },
];
