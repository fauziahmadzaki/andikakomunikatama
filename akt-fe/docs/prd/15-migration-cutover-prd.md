# 15 — Migration & Cutover PRD

## Metadata

| Field | Value |
|---|---|
| Document ID | PRD-15 |
| Version | 1.0 |
| Status | Draft |
| Phase | 4 |
| Dependencies | All v1 PRDs |
| Related tables | all target tables; legacy mapping workbook |
| Related ERD | `erd-v2-all.mmd` |

## 1. Summary & Goals

Migrate data from the legacy e-Billing system to the new normalized schema
without losing financial accuracy, customer history, or operational continuity.

### Goals

- Repeatable extract, transform, load pipeline.
- Mapping from legacy tables/fields to the new schema.
- Data cleaning and conflict reports.
- Dry-run and reconciliation.
- Dual-run for at least one billing cycle.
- Cutover and rollback plan.
- Post-migration verification.

### Non-goals

- Rewriting legacy business logic that was never documented.
- Migrating unused/empty modules.
- Migrating plaintext passwords as-is.

## 2. Actors & Permissions

| Actor | Capabilities |
|---|---|
| migration lead | Run pipeline, approve cutover |
| `owner` | Final cutover approval |
| data engineer | Extract/transform scripts |
| `finance` | Reconcile financial data |
| operations | Dual-run and verification |

Permissions:

```txt
migration.run, migration.approve
migration.reconcile
```

## 3. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| MIG-01 | Extract legacy data into staging tables/files without mutating the source. | M |
| MIG-02 | Maintain a versioned mapping document for every legacy table/field. | M |
| MIG-03 | Clean and normalize data before load. | M |
| MIG-04 | Dry-run reports row counts, warnings, and errors without writing production. | M |
| MIG-05 | Load is idempotent per migration batch. | M |
| MIG-06 | Financial balances reconcile to the legacy system. | M |
| MIG-07 | Dual-run compares invoices, payments, and status for a full cycle. | M |
| MIG-08 | Cutover has a documented rollback path. | M |
| MIG-09 | Legacy IDs/codes are preserved for traceability. | M |
| MIG-10 | Plaintext passwords are not migrated. | M |
| MIG-11 | Migration logs and reconciliation reports are retained. | M |
| MIG-12 | Cutover requires sign-off from product, finance, and operations. | M |

## 4. Migration Mapping (Summary)

| Legacy | Target |
|---|---|
| `warga` staff roles | `users` + `employees` |
| `warga` customer roles | `customers` + addresses + contacts + identities |
| `warga` reseller/agent | `customers` + `resellers` |
| `lokasi` | `branches` |
| `perusahaan` | `company_profiles` |
| `tipe_pembayaran` | `plans` + `plan_prices` + `plan_branches` |
| `diskon*` | `discounts` + `discount_scopes` |
| `langganan` derived fields | `subscriptions` + `services` |
| `tagihan` | `invoices` + `invoice_items` |
| `pembayaran` / `data-ipl` | `payments` + `payment_allocations` |
| `deposit` | `deposits` + `deposit_transactions` |
| `setor` | `sales_deposits` |
| `ticket` / `ticket_detail` | `tickets` + `ticket_events` |
| `installasi` | `installation_reports` + `ticket_devices` |
| `mutasi` / `pemasukan` / `pengeluaran` | journal entries + lines |
| `akun` / `kategori_akun` / `rekening` | COA / account types / bank accounts |
| `master_gaji` / `absensi` / payroll | HR tables (deferred, if not v1) |
| `voucher*` | voucher tables (deferred) |
| `poin*` | loyalty tables (deferred) |
| `notifikasi_template` | notification templates |
| `log_aktivitas` | `audit_logs` |

Full field mapping lives in a separate versioned mapping workbook.

## 5. Workflows

### WF-MIG-01 — Legacy extract

- Actors: data engineer
- Trigger: migration run

Steps:

1. Freeze schema changes in the legacy system for the extraction window.
2. Export tables and files using read-only access.
3. Store raw extracts with checksums and timestamps.
4. Record row counts per table.
5. Never mutate the legacy source.
6. Store extract manifest.

### WF-MIG-02 — Mapping and cleaning

- Actors: data engineer, finance
- Trigger: after extract

Steps:

1. Apply mapping rules for roles, plans, branches, enums.
2. Normalize phone numbers and addresses.
3. Deduplicate NIK/phone; produce a conflict report.
4. Drop plaintext passwords; generate password reset list.
5. Convert base64 IDs to UUIDs; preserve `legacy_code`.
6. Map enum values to canonical values.
7. Produce a transformation report.

### WF-MIG-03 — Dry run

- Actors: migration lead
- Trigger: before any production load

Steps:

1. Load staging data.
2. Validate referential integrity and required fields.
3. Run financial calculations on sample customers.
4. Produce counts: customers, subscriptions, invoices, payments, tickets.
5. Produce error/warning report.
6. Do not write to production.
7. Review with finance and operations.

### WF-MIG-04 — Dual-run reconciliation

- Actors: finance, operations, migration lead
- Trigger: pilot period

Steps:

1. Run the new system in parallel for one billing cycle.
2. Compare invoices, payments, outstanding balances, and statuses.
3. Investigate discrepancies.
4. Fix mapping/rules and rerun.
5. Sign off when reconciliation thresholds are met.
6. Record reconciliation reports.

Acceptance thresholds:

- Customer count matches or differences are explained.
- Invoice totals match within an agreed tolerance (default 0).
- Outstanding balances match.
- Active subscription count matches.
- Payment totals match.

### WF-MIG-05 — Cutover and rollback

- Actors: migration lead, owner, operations
- Trigger: approved dual-run

Steps:

1. Announce cutover window.
2. Stop writes in the legacy system.
3. Run final delta extract and load.
4. Verify row counts and financial totals.
5. Enable the new system for all users.
6. Keep the legacy system read-only for 6 months.
7. Monitor errors and support tickets.
8. If critical failure occurs, rollback to legacy within the agreed window.
9. Record cutover report and sign-off.

Rollback rules:

- Legacy remains available read-only until sign-off.
- Rollback requires owner approval.
- Data created in the new system during the window must be exported.

## 6. Verification Checklist

- [ ] All branches mapped.
- [ ] Staff users mapped; passwords reset.
- [ ] Customers and addresses mapped.
- [ ] Plans and prices mapped.
- [ ] Subscriptions and services mapped.
- [ ] Devices and inventory mapped.
- [ ] Invoices and payments mapped; allocations correct.
- [ ] Outstanding balances reconcile.
- [ ] Ledger opens with correct balances.
- [ ] Tickets and history mapped.
- [ ] Notification templates mapped.
- [ ] Audit log baseline created.
- [ ] File attachments accessible.
- [ ] Role and branch scope verified with sample users.

## 7. Data References

- All target tables in `database-design.md`.
- `docs/legacy/` for source evidence.
- `docs/erd-v2-all.mmd` for relationships.
- Mapping workbook (separate artifact).

## 8. API / Routes

Migration is primarily an internal CLI/job, not a public API. Optional
operator-only routes:

```txt
POST   /api/migration/extract
POST   /api/migration/validate
POST   /api/migration/load
GET    /api/migration/runs/:id
GET    /api/migration/reconciliation
POST   /api/migration/cutover
POST   /api/migration/rollback
```

## 9. Audit & Reporting

Audit events:

- `migration.extract_started/completed`
- `migration.validation_completed`
- `migration.load_started/completed/failed`
- `migration.reconciliation_completed`
- `migration.cutover_approved`
- `migration.rollback`

Reports:

- Row-count reconciliation.
- Financial reconciliation.
- Conflict/duplicate report.
- Password reset list.
- Orphan file report.

## 10. Acceptance Criteria

```gherkin
Scenario: Dry run does not write production
  Given a staging extract
  When the migration dry run executes
  Then validation reports are produced
  And no production rows are created

Scenario: Financial reconciliation
  Given legacy unpaid invoices and payments
  When migration completes
  Then invoice balances and payment totals match
  And discrepancies are listed

Scenario: Cutover rollback
  Given a critical failure after cutover
  When rollback is approved
  Then the legacy system is restored read-only
  And new-system writes are exported for reconciliation
```

## 11. Edge Cases & Failure Handling

- Duplicate customer records → manual decision, no silent merge.
- Missing plan/price → assign fallback and report.
- Orphan payments → quarantine and reconcile.
- Timezone differences → normalize to Asia/Jakarta.
- Base64 ID collisions → new UUID + legacy mapping.
- Partial file migration → retry and report.

## 12. Open Questions

- What is the acceptable reconciliation tolerance?
- How long is the rollback window?
- Which modules are excluded from v1 migration?
- Who signs off on cutover?
