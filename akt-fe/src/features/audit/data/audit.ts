export type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actor: string;
  branch: string;
  description: string;
  createdAt: string;
};

export const seedAuditLogs: AuditLog[] = [
  {
    id: "aud-1",
    action: "customer.created",
    entityType: "customer",
    entityId: "2512090729",
    actor: "Customer Service",
    branch: "JKT-01",
    description: "Pelanggan baru ditambahkan.",
    createdAt: "2026-11-07T09:42:00+07:00",
  },
  {
    id: "aud-2",
    action: "invoice.batch_generated",
    entityType: "billing_run",
    entityId: "RUN-2026-11",
    actor: "Administrator",
    branch: "JKT-01",
    description: "Generate invoice massal periode November.",
    createdAt: "2026-11-07T08:15:00+07:00",
  },
  {
    id: "aud-3",
    action: "payment.verified",
    entityType: "payment",
    entityId: "PAY-2026-006319",
    actor: "Administrator",
    branch: "BDG-01",
    description: "Pembayaran transfer diverifikasi.",
    createdAt: "2026-11-06T16:28:00+07:00",
  },
  {
    id: "aud-4",
    action: "branch.updated",
    entityType: "branch",
    entityId: "BR-MDN",
    actor: "Administrator",
    branch: "MDN-01",
    description: "Status cabang Medan diubah menjadi nonaktif.",
    createdAt: "2026-11-06T14:02:00+07:00",
  },
  {
    id: "aud-5",
    action: "user.updated",
    entityType: "user",
    entityId: "USR-BAYU",
    actor: "Administrator",
    branch: "SBY-01",
    description: "Role pengguna diperbarui.",
    createdAt: "2026-11-06T11:45:00+07:00",
  },
  {
    id: "aud-6",
    action: "subscription.suspended",
    entityType: "subscription",
    entityId: "SUB-001282",
    actor: "NOC",
    branch: "JKT-01",
    description: "Isolir manual karena tunggakan.",
    createdAt: "2026-11-05T17:20:00+07:00",
  },
  {
    id: "aud-7",
    action: "customer.imported",
    entityType: "import_batch",
    entityId: "IMP-2026-033",
    actor: "Customer Service",
    branch: "BDG-01",
    description: "Import 42 pelanggan baru.",
    createdAt: "2026-11-05T10:10:00+07:00",
  },
  {
    id: "aud-8",
    action: "auth.login_succeeded",
    entityType: "user",
    entityId: "USR-ADMIN",
    actor: "Administrator",
    branch: "JKT-01",
    description: "Login berhasil.",
    createdAt: "2026-11-05T08:00:00+07:00",
  },
];
