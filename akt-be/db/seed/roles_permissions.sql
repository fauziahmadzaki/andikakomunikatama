-- ============================================================================
-- MURANET AKT - Seed Roles & Permissions (RBAC)
-- ----------------------------------------------------------------------------
-- Idempotent: aman dijalankan berulang kali.
--   * Membuat tabel roles, permissions, role_permissions jika belum ada.
--   * Seed role: admin, cs, teknisi.
--   * Seed seluruh permission yang dipakai frontend.
--   * Admin mendapat SEMUA permission (semua menu terbuka).
--   * cs & teknisi mendapat permission default sesuai frontend.
--   * Memastikan user `admin` memakai role `admin`.
--
-- Cara run: lihat README di bagian bawah file ini.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. TABEL
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id          varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  code        varchar(50) NOT NULL UNIQUE,
  name        varchar(100) NOT NULL,
  description text NOT NULL DEFAULT '',
  is_system   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS permissions (
  id          varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  code        varchar(100) NOT NULL UNIQUE,
  label       varchar(150) NOT NULL,
  module      varchar(100) NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       varchar(36) NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
  permission_id varchar(36) NOT NULL REFERENCES permissions (id) ON DELETE CASCADE,
  granted_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS role_permissions_permission_id_idx
  ON role_permissions (permission_id);

CREATE INDEX IF NOT EXISTS permissions_module_idx
  ON permissions (module);

-- ----------------------------------------------------------------------------
-- 2. ROLES
-- ----------------------------------------------------------------------------
INSERT INTO roles (code, name, description) VALUES
  ('admin',   'Administrator',    'Akses penuh ke seluruh sistem.'),
  ('cs',      'Customer Service', 'Layani pendaftaran, tagihan, dan tiket pelanggan.'),
  ('teknisi', 'Teknisi',          'Pantau jaringan dan tangani gangguan pelanggan.')
ON CONFLICT (code) DO UPDATE
  SET name        = EXCLUDED.name,
      description = EXCLUDED.description,
      updated_at  = now();

-- ----------------------------------------------------------------------------
-- 3. PERMISSIONS
-- ----------------------------------------------------------------------------
INSERT INTO permissions (code, label, module) VALUES
  ('customer.read',          'Lihat pelanggan',              'Pelanggan'),
  ('customer.create',        'Tambah pelanggan',             'Pelanggan'),
  ('customer.update',        'Ubah pelanggan',               'Pelanggan'),
  ('customer.deactivate',    'Nonaktifkan pelanggan',        'Pelanggan'),
  ('customer.import',        'Import pelanggan',             'Pelanggan'),
  ('customer.export',        'Export pelanggan',             'Pelanggan'),
  ('invoice.read',           'Lihat tagihan',                'Billing'),
  ('invoice.generate',       'Generate tagihan',             'Billing'),
  ('invoice.void',           'Void tagihan',                 'Billing'),
  ('payment.read',           'Lihat pembayaran',             'Billing'),
  ('payment.create',         'Catat pembayaran',             'Billing'),
  ('payment.verify',         'Verifikasi pembayaran',        'Billing'),
  ('plan.read',              'Lihat paket',                  'Katalog'),
  ('plan.create',            'Tambah paket',                 'Katalog'),
  ('plan.update',            'Ubah paket',                   'Katalog'),
  ('plan_price.manage',      'Kelola harga paket',           'Katalog'),
  ('plan_branch.manage',     'Kelola ketersediaan paket',    'Katalog'),
  ('discount.read',          'Lihat diskon',                 'Katalog'),
  ('discount.create',        'Tambah diskon',                'Katalog'),
  ('discount.update',        'Ubah diskon',                  'Katalog'),
  ('subscription.read',      'Lihat langganan',              'Langganan'),
  ('subscription.create',    'Buat langganan',               'Langganan'),
  ('subscription.update',    'Ubah langganan',               'Langganan'),
  ('subscription.activate',  'Aktifkan langganan',           'Langganan'),
  ('subscription.suspend',   'Isolir langganan',             'Langganan'),
  ('subscription.terminate', 'Terminasi langganan',          'Langganan'),
  ('subscription.migrate',   'Migrasi langganan',            'Langganan'),
  ('service.read',           'Lihat service',                'Langganan'),
  ('service.provision',      'Provision service',            'Langganan'),
  ('service.suspend',        'Suspend service',              'Langganan'),
  ('service.terminate',      'Terminasi service',            'Langganan'),
  ('network.read',           'Lihat jaringan',               'Jaringan'),
  ('network.manage',         'Kelola jaringan',              'Jaringan'),
  ('credential.rotate',      'Rotasi credential',            'Jaringan'),
  ('inventory.read',         'Lihat inventaris',             'Jaringan'),
  ('inventory.manage',       'Kelola inventaris',            'Jaringan'),
  ('inventory.move',         'Movement inventaris',          'Jaringan'),
  ('topology.manage',        'Kelola topologi',              'Jaringan'),
  ('finance.read',           'Lihat keuangan',               'Keuangan'),
  ('finance.manage',         'Kelola keuangan',              'Keuangan'),
  ('report.view',            'Lihat laporan',                'Laporan'),
  ('report.export',          'Export laporan',               'Laporan'),
  ('notification.read',      'Lihat notifikasi',             'Notifikasi'),
  ('notification.manage',    'Kelola notifikasi',            'Notifikasi'),
  ('integration.read',       'Lihat integrasi',              'Integrasi'),
  ('integration.manage',     'Kelola integrasi',             'Integrasi'),
  ('migration.read',         'Lihat migrasi',                'Migrasi'),
  ('migration.manage',       'Kelola migrasi',               'Migrasi'),
  ('ticket.read',            'Lihat tiket',                  'Layanan'),
  ('ticket.create',          'Buat tiket',                   'Layanan'),
  ('ticket.assign',          'Assign tiket',                 'Layanan'),
  ('ticket.close',           'Tutup tiket',                  'Layanan'),
  ('company.read',           'Lihat profil perusahaan',      'Pengaturan'),
  ('company.update',         'Ubah profil perusahaan',       'Pengaturan'),
  ('branch.read',            'Lihat cabang',                 'Pengaturan'),
  ('branch.manage',          'Kelola cabang',                'Pengaturan'),
  ('user.read',              'Lihat pengguna',               'Pengaturan'),
  ('user.manage',            'Kelola pengguna',              'Pengaturan'),
  ('role.manage',            'Kelola role & akses',          'Pengaturan'),
  ('audit.read',             'Lihat audit log',              'Pengaturan'),
  ('access.review',          'Access review',                'Pengaturan'),
  ('setting.read',           'Lihat pengaturan',             'Pengaturan'),
  ('setting.update',         'Ubah pengaturan',              'Pengaturan'),
  ('sequence.read',          'Lihat penomoran',              'Pengaturan'),
  ('sequence.manage',        'Kelola penomoran',             'Pengaturan'),
  ('security.manage',        'Kelola keamanan',              'Pengaturan')
ON CONFLICT (code) DO UPDATE
  SET label      = EXCLUDED.label,
      module     = EXCLUDED.module,
      updated_at = now();

-- ----------------------------------------------------------------------------
-- 4. ROLE -> PERMISSION
-- ----------------------------------------------------------------------------

-- admin: SEMUA permission
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'admin'
ON CONFLICT DO NOTHING;

-- cs: permission default frontend
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code = ANY (ARRAY[
  'customer.read',
  'customer.create',
  'customer.update',
  'customer.import',
  'customer.export',
  'invoice.read',
  'payment.read',
  'payment.create',
  'plan.read',
  'discount.read',
  'subscription.read',
  'subscription.create',
  'subscription.activate',
  'subscription.suspend',
  'service.read',
  'branch.read',
  'ticket.read',
  'ticket.create',
  'report.view',
  'notification.read'
])
WHERE r.code = 'cs'
ON CONFLICT DO NOTHING;

-- teknisi: permission default frontend
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code = ANY (ARRAY[
  'customer.read',
  'plan.read',
  'subscription.read',
  'service.read',
  'service.provision',
  'network.read',
  'network.manage',
  'inventory.read',
  'inventory.move',
  'credential.rotate',
  'ticket.read',
  'ticket.assign',
  'ticket.close',
  'branch.read',
  'report.view',
  'notification.read',
  'integration.read'
])
WHERE r.code = 'teknisi'
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. PASTIKAN USER ADMIN MEMAKAI ROLE admin
-- ----------------------------------------------------------------------------
UPDATE users
SET role       = 'admin',
    updated_at = now()
WHERE (username = 'admin' OR email = 'admin@akt.net.id')
  AND role <> 'admin';

COMMIT;

-- ============================================================================
-- CARA RUN (dari root repo: D:\Vs Code\Project\akt)
-- ============================================================================
--
-- Opsi A - copy ke container lalu jalankan (paling aman di PowerShell):
--   docker cp akt-be/db/seed/roles_permissions.sql akt_postgres:/tmp/roles_permissions.sql
--   docker exec -i akt_postgres psql -U postgres -d akt_db -f /tmp/roles_permissions.sql
--
-- Opsi B - Git Bash / WSL:
--   docker exec -i akt_postgres psql -U postgres -d akt_db < akt-be/db/seed/roles_permissions.sql
--
-- Opsi C - PowerShell:
--   Get-Content .\akt-be\db\seed\roles_permissions.sql -Raw |
--     docker exec -i akt_postgres psql -U postgres -d akt_db
--
-- Opsi D - psql lokal:
--   psql "postgresql://postgres:postgres@localhost:5432/akt_db" -f akt-be/db/seed/roles_permissions.sql
--
-- Verifikasi:
--   docker exec -it akt_postgres psql -U postgres -d akt_db -c ^
--     "SELECT r.code, count(rp.permission_id) AS total FROM roles r LEFT JOIN role_permissions rp ON rp.role_id = r.id GROUP BY r.code ORDER BY r.code;"
-- ============================================================================
