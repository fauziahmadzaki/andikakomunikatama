# Dokumentasi MURANET

Dokumentasi produk, desain database, dan PRD implementasi untuk platform
internal MURANET.

## PRD v1

Semua PRD ada di [`prd/`](prd/). Mulai dari:

- [`prd/00-general-overview-task-prd.md`](prd/00-general-overview-task-prd.md)
  — ringkasan produk, scope v1, role, business rules, workflow catalog, task
  breakdown, dan definition of done.

| No | PRD |
|---|---|
| 00 | General Overview & Task |
| 01 | Foundation |
| 02 | Auth & RBAC |
| 03 | Customers |
| 04 | Catalog & Pricing |
| 05 | Subscriptions & Services |
| 06 | Network & Inventory |
| 07 | Billing & Invoicing |
| 08 | Payments & Reconciliation |
| 09 | Ticketing & Fieldwork |
| 10 | Finance & Accounting |
| 11 | Notifications |
| 12 | Reporting & Dashboards |
| 13 | Integrations |
| 14 | Security & Compliance |
| 15 | Migration & Cutover |

Scope v1 mencakup Phase 0–4 di `00`. Modul HR/Payroll, Voucher/Reseller,
Loyalty, Customer Portal, dan Partnership ditunda ke versi berikutnya.

## Database Design v2

| File | Isi |
|---|---|
| [`database-design.md`](database-design.md) | Konvensi, normalisasi, mapping legacy → baru, katalog tabel, index, keamanan, migrasi |
| [`erd-v2-core.mmd`](erd-v2-core.mmd) | Core: company, identity, customer, plan, subscription, network, ticket |
| [`erd-v2-finance.mmd`](erd-v2-finance.mmd) | Invoice, payment, deposit, double-entry accounting |
| [`erd-v2-hr.mmd`](erd-v2-hr.mmd) | HR, attendance, payroll (deferred) |
| [`erd-v2-growth.mmd`](erd-v2-growth.mmd) | Reseller, voucher, loyalty, notification (deferred) |
| [`erd-v2-all.mmd`](erd-v2-all.mmd) | Gabungan semua ERD v2 |

## Legacy Reference

Dokumen hasil reverse engineering sistem lama ada di [`legacy/`](legacy/):

- `PRD.md`
- `data-dictionary.md`
- `erd.md`
- `erd-core.mmd`, `erd-keuangan.mmd`, `erd-sdm.mmd`
- `flows.md`
- `rbac.md`
- `sitemap.md`
- `fitur-kelola-data.md`

Dokumen legacy hanya referensi historis; keputusan implementasi mengikuti PRD
v1 dan `database-design.md`.

## Catatan

- File `.mmd` bisa dirender di GitHub, VS Code (ekstensi Mermaid), atau
  Mermaid Live Editor.
- Folder `docs/` di-ignore dari Git; dokumen ini bersifat lokal sampai
  diputuskan untuk dipublikasikan.
