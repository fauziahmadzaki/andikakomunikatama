# 00 — General Overview & Task PRD

## Metadata

| Field | Value |
|---|---|
| Document ID | PRD-00 |
| Version | 1.0 |
| Status | Draft |
| Phase | 0 |
| Owner | Product / Engineering |
| Dependencies | `docs/database-design.md`, `erd-v2-all.mmd` |
| Supersedes | `docs/legacy/PRD.md` (legacy reference only) |

## 1. Product Summary

MURANET Internal Systems is an operations platform for an Internet Service
Provider. It covers the full internal workflow: customers, packages,
subscriptions, network provisioning, billing, payments, field tickets,
accounting, notifications, and operational reporting.

The legacy e-Billing system is the source of historical behavior. The new
platform keeps the validated business rules while replacing the legacy schema,
authorization model, and security posture.

### Product principles

1. Server-side authorization is mandatory; menus are not security.
2. Every mutation is auditable.
3. Financial data is double-entry and immutable after posting.
4. Customer, subscription, and service are separate concepts.
5. Batch jobs and webhooks must be idempotent.
6. No plaintext credentials in the database.
7. UI copy is Indonesian; code, identifiers, and documentation are English.

## 2. V1 Scope

### In scope

| PRD | Domain |
|---|---|
| 01 | Foundation: company, branches, settings, numbering, files, audit |
| 02 | Authentication, users, roles, permissions, branch scope |
| 03 | Customers: master data, addresses, contacts, identities, import/export |
| 04 | Plans, price history, availability, discounts, prorate, tax |
| 05 | Subscriptions, services, provisioning, suspension, termination |
| 06 | Network assets, inventory, topology, ACS |
| 07 | Invoices, invoice items, PDF, status, overdue |
| 08 | Payments, allocations, deposits, sales deposits, gateway, reconciliation |
| 09 | Ticketing, assignments, schedules, field work, installation reports |
| 10 | Finance: COA, double-entry journal, cash, petty cash, reimbursement, PO |
| 11 | Notifications: templates, WhatsApp, email, Telegram, announcements |
| 12 | Reporting and role-based dashboards |
| 13 | Integrations and device adapters |
| 14 | Security, compliance, audit, retention |
| 15 | Migration, dual-run, cutover, rollback |

### Out of scope for v1

- HR, attendance, and payroll (deferred to v1.1).
- Vouchers, resellers, and hotspot sales (deferred to v1.1).
- Loyalty points and rewards (deferred to v1.2).
- Customer self-service portal and member card public page (deferred to v1.2).
- Partner self-service dashboard and revenue sharing portal (deferred to v2).
- PPOB, e-Faktur automation, native mobile app, and ML features.
- Multi-tenant deployment.

## 3. Architecture & Data Decisions

| Topic | Decision |
|---|---|
| Framework | Next.js App Router |
| Database | PostgreSQL 15+ |
| Primary key | UUID (`gen_random_uuid()`) |
| Tenancy | Single company |
| Data scope | `branch_id` + role permissions |
| Accounting | Full double-entry |
| Subscription model | One subscription → many services |
| Timezone | `Asia/Jakarta`, store `timestamptz` in UTC |
| Currency | IDR, `numeric(14,2)` |
| Soft delete | `deleted_at` |
| Secrets | `secret_ref` (Vault/KMS) |
| File storage | Object storage, signed URLs |

## 4. Canonical Roles

| Role | Description | Legacy mapping examples |
|---|---|---|
| `owner` | Company owner / investor | Administrator, Investor |
| `branch_manager` | Branch manager | Kepala Cabang, Admin Cabang |
| `admin` | Central operations admin | Admin Pusat, Admin Lokasi |
| `cs` | Customer service | CS, CS Cabang |
| `sales` | Sales / acquisition | Sales, Kepala Sales |
| `technician` | Field technician | Teknisi, Kepala Teknisi |
| `noc` | Network operations center | NOC |
| `finance` | Finance / accounting | Admin Keuangan |
| `hrd` | HR and payroll | HRD |
| `warehouse` | Inventory / warehouse | Admin Gudang |
| `reseller` | Reseller / agent | Reseller, Agen |
| `customer` | Customer portal account | Playstore User |

Branch scope rules:

- `owner` and `admin` may access all branches.
- `branch_manager`, `cs`, `sales`, `technician`, `noc` are scoped to assigned branches.
- `finance` and `hrd` may access all branches unless restricted.
- Object-level checks are mandatory; branch scope alone is not sufficient.

## 5. Permission Matrix (Summary)

| Capability | Owner | Branch Mgr | Admin | CS | Sales | Technician | NOC | Finance | HRD | Warehouse |
|---|---|---|---|---|---|---|---|---|---|---|
| Company settings | full | read | read | — | — | — | — | read | — | — |
| Branch management | full | read | full | — | — | — | — | — | — | — |
| User & role management | full | branch | full | — | — | — | — | — | — | — |
| Customer CRUD | full | branch | branch | branch | own | read | read | read | — | — |
| Plan & discount | full | read | full | read | read | — | — | read | — | — |
| Subscription lifecycle | full | branch | branch | branch | own | — | read | read | — | — |
| Network & inventory | full | read | read | — | — | edit | edit | — | — | edit |
| Invoice & payment | full | branch | branch | branch | own | — | — | read | — | — |
| Ticket | full | branch | branch | branch | create | execute | execute | — | — | — |
| Finance & ledger | full | read | read | — | — | — | — | full | — | — |
| Reporting | full | branch | branch | branch | own | own | own | full | own | own |

Detailed permissions are defined in each PRD.

## 6. Global Business Rules

| ID | Rule |
|---|---|
| BR-001 | Due day is 1–31; values beyond the current month length clamp to the last day. |
| BR-002 | PPN is calculated after discount. |
| BR-003 | Prorate applies only to the registration month and only for monthly plans. |
| BR-004 | Discount is applied before tax. |
| BR-005 | Sales incentive is calculated from deposited cash, not issued invoices. |
| BR-006 | Automatic suspension applies only to subscriptions with automatic billing mode. |
| BR-007 | Partial payments do not mark an invoice as paid until the total is met. |
| BR-008 | Points are credited only after payment verification. |
| BR-009 | Voucher stock decreases at generation, not at sale. |
| BR-010 | Payroll uses cut-off periods, not calendar months. |
| BR-011 | Overtime must be approved before payroll. |
| BR-012 | BHP/USO/ISP fee is calculated from revenue after PPN. |
| BR-013 | Every mutation writes an audit log. |
| BR-014 | Every mutation checks authorization server-side. |
| BR-015 | Batch jobs, imports, and webhooks must be idempotent. |
| BR-016 | Financial documents post balanced journal entries. |
| BR-017 | Invoice numbers, payment numbers, and journal numbers are unique and immutable. |
| BR-018 | Soft-deleted records are excluded from operational queries by default. |
| BR-019 | Phone numbers are normalized to E.164 (`+62...`). |
| BR-020 | All timestamps are stored in UTC and rendered in Asia/Jakarta. |

## 7. Global Status Models

### Customer

`draft` → `active` → `suspended` → `terminated` / `inactive`

### Subscription

`draft` → `active` → `suspended` → `terminated`

### Service

`pending` → `provisioned` → `active` → `suspended` → `terminated`

### Invoice

`draft` → `issued` → `partial` → `paid` / `overdue` / `void`

### Payment

`pending` → `verified` / `rejected` → `void`

### Ticket

`open` → `in_progress` → `pending` / `scheduled` →
`installation_success` / `installation_failed` → `closed`

### Journal entry

`draft` → `posted` → `void`

### Payslip (deferred)

`draft` → `approved` → `paid`

## 8. Number Sequences

| Sequence | Format example | Reset |
|---|---|---|
| Customer number | `CUS-2026-000001` | yearly |
| Invoice number | `INV-2026-000001` | yearly |
| Payment number | `PAY-2026-000001` | yearly |
| Ticket number | `TKT-2026-000001` | yearly |
| Journal entry | `JE-2026-000001` | yearly |
| Purchase order | `PO-2026-000001` | yearly |
| Voucher code | configurable prefix + random | per batch |

Sequences are generated transactionally and never reused.

## 9. Cross-Cutting Conventions

- Audit log on every create, update, delete, status change, approval, and
  sensitive read.
- Notifications are event-driven; delivery must not block the main transaction.
- Use `request_id` / idempotency keys for imports, batch jobs, and webhooks.
- Use optimistic locking or row-level locks for balances, stock, and payments.
- Errors follow a consistent shape: `code`, `message`, `field_errors`.
- 403 is returned explicitly for authorization failures.
- Files are attached through `files` + `attachments`.
- Lists use server-side pagination, filtering, and sorting.

## 10. Feature Map

| PRD | Domain | Phase | Depends on | Key tables | Key workflows |
|---|---|---|---|---|---|
| 01 | Foundation | 0 | — | `company_profiles`, `branches`, `system_settings`, `files` | WF-FND |
| 02 | Auth & RBAC | 0 | 01 | `users`, `roles`, `permissions` | WF-AUTH |
| 03 | Customers | 1 | 01, 02 | `customers`, `customer_*` | WF-CUST |
| 04 | Catalog & Pricing | 1 | 01 | `plans`, `plan_prices`, `discounts` | WF-CAT |
| 05 | Subscriptions & Services | 1 | 03, 04, 06 | `subscriptions`, `services` | WF-SUB |
| 06 | Network & Inventory | 1 | 01 | `routers`, `olts`, `passive_devices`, `inventory_*` | WF-NET |
| 07 | Billing & Invoicing | 1 | 04, 05 | `invoices`, `invoice_items` | WF-BILL |
| 08 | Payments & Reconciliation | 1 | 07 | `payments`, `payment_allocations`, `deposits` | WF-PAY |
| 09 | Ticketing & Fieldwork | 2 | 03, 05, 06 | `tickets`, `ticket_events` | WF-TCK |
| 10 | Finance & Accounting | 2 | 07, 08 | `journal_entries`, `journal_lines` | WF-FIN |
| 11 | Notifications | 2 | 03, 07, 08, 09 | `notification_*` | WF-NOTIF |
| 12 | Reporting | 3 | 03–10 | read models | WF-RPT |
| 13 | Integrations | 1 | 05, 06 | `integration_logs` | WF-INT |
| 14 | Security & Compliance | 0 | 02 | `audit_logs` | WF-SEC |
| 15 | Migration & Cutover | 4 | all | legacy mapping | WF-MIG |

## 11. Workflow Catalog

### Foundation

- WF-FND-01 Company profile setup
- WF-FND-02 Branch create/update/deactivate
- WF-FND-03 System settings update
- WF-FND-04 Number sequence issue
- WF-FND-05 File upload and signed URL
- WF-FND-06 Audit log query

### Authentication

- WF-AUTH-01 Login
- WF-AUTH-02 Logout and session expiry
- WF-AUTH-03 Forgot/reset password
- WF-AUTH-04 2FA enrollment and verification
- WF-AUTH-05 Create user and assign role/branch
- WF-AUTH-06 Update/deactivate user
- WF-AUTH-07 Permission check and 403
- WF-AUTH-08 Access review

### Customers

- WF-CUST-01 Create customer wizard
- WF-CUST-02 Save draft and resume
- WF-CUST-03 Duplicate detection and merge suggestion
- WF-CUST-04 Update customer
- WF-CUST-05 Deactivate/reactivate customer
- WF-CUST-06 Import dry-run and commit
- WF-CUST-07 Export
- WF-CUST-08 Customer 360 view
- WF-CUST-09 Saved segment

### Catalog

- WF-CAT-01 Create/update plan
- WF-CAT-02 Publish price change
- WF-CAT-03 Manage branch availability
- WF-CAT-04 Create/update discount
- WF-CAT-05 Configure discount scope
- WF-CAT-06 Preview prorate and tax
- WF-CAT-07 Bulk plan migration

### Subscriptions

- WF-SUB-01 Create subscription
- WF-SUB-02 Add and provision service
- WF-SUB-03 Activate subscription
- WF-SUB-04 Upgrade/downgrade
- WF-SUB-05 Manual suspend/reactivate
- WF-SUB-06 Automatic suspension scheduler
- WF-SUB-07 Reactivate after payment
- WF-SUB-08 Terminate subscription
- WF-SUB-09 Bulk migration and due date change

### Network

- WF-NET-01 Add and test router
- WF-NET-02 Add OLT
- WF-NET-03 Build passive topology
- WF-NET-04 Inventory item and movement
- WF-NET-05 Install device
- WF-NET-06 Credential rotation
- WF-NET-07 Topology and nearest ODP
- WF-NET-08 ACS synchronization

### Billing

- WF-BILL-01 Mass invoice preview
- WF-BILL-02 Commit mass invoice
- WF-BILL-03 Manual invoice
- WF-BILL-04 Void invoice
- WF-BILL-05 Overdue marking
- WF-BILL-06 Invoice PDF
- WF-BILL-07 Resend invoice notification

### Payments

- WF-PAY-01 Record payment
- WF-PAY-02 Upload and verify payment proof
- WF-PAY-03 Allocate partial and multi-invoice payment
- WF-PAY-04 Deposit top-up and usage
- WF-PAY-05 Sales deposit settlement
- WF-PAY-06 Payment gateway callback
- WF-PAY-07 Reconciliation
- WF-PAY-08 Refund or void payment

### Ticketing

- WF-TCK-01 Create customer ticket
- WF-TCK-02 Create general ticket
- WF-TCK-03 Triage and assign
- WF-TCK-04 Schedule installation
- WF-TCK-05 Status transition
- WF-TCK-06 Append event
- WF-TCK-07 Record device usage
- WF-TCK-08 Installation report
- WF-TCK-09 Close ticket and SLA

### Finance

- WF-FIN-01 COA setup
- WF-FIN-02 Post journal entry
- WF-FIN-03 Record income
- WF-FIN-04 Record expense
- WF-FIN-05 Petty cash
- WF-FIN-06 Reimbursement approval
- WF-FIN-07 Payment request approval
- WF-FIN-08 Purchase order lifecycle
- WF-FIN-09 Period close
- WF-FIN-10 Financial report

### Notifications

- WF-NOTIF-01 Template CRUD
- WF-NOTIF-02 Event-triggered send
- WF-NOTIF-03 Scheduled reminder
- WF-NOTIF-04 Blast and announcement
- WF-NOTIF-05 Retry and failover
- WF-NOTIF-06 Opt-out and quiet hours
- WF-NOTIF-07 Notification log and health

### Reporting

- WF-RPT-01 Role dashboard
- WF-RPT-02 Report query and filter
- WF-RPT-03 Export
- WF-RPT-04 Scheduled report
- WF-RPT-05 KPI drilldown

### Integrations

- WF-INT-01 Adapter configuration
- WF-INT-02 Connection test
- WF-INT-03 Provisioning command
- WF-INT-04 Webhook/callback idempotency
- WF-INT-05 Retry and circuit breaker
- WF-INT-06 Credential usage and rotation
- WF-INT-07 Integration log and health

### Security & Migration

- WF-SEC-01 Audit review
- WF-SEC-02 PII access
- WF-SEC-03 Rate limit and lockout
- WF-SEC-04 Access review
- WF-SEC-05 Retention job
- WF-MIG-01 Legacy extract
- WF-MIG-02 Mapping and cleaning
- WF-MIG-03 Dry run
- WF-MIG-04 Dual-run reconciliation
- WF-MIG-05 Cutover and rollback

## 12. Task Breakdown Format

Every implementation task must use this format:

```txt
EPIC-02 Authentication & Authorization
  TASK-02-01 Implement login API
    - FR: AUTH-01
    - WF: WF-AUTH-01
    - Depends on: TASK-01-04
    - Touchpoints: POST /api/auth/login, users, sessions
    - Acceptance: AUTH-01 AC-1..AC-3
```

Task status: `todo`, `in_progress`, `blocked`, `review`, `done`.

## 13. Delivery Phases

| Phase | PRDs | Outcome |
|---|---|---|
| 0 | 01, 02, 14 | Foundation, auth, RBAC, audit |
| 1 | 03, 04, 05, 06, 07, 08, 13 | Customer-to-cash core |
| 2 | 09, 10, 11 | Field operations, accounting, notifications |
| 3 | 12 | Reporting and dashboards |
| 4 | 15 | Migration and cutover |

## 14. Definition of Done

A feature is done only when:

- All FR and workflow steps are implemented.
- Authorization is enforced server-side, including branch scope.
- Validation is enforced server-side, not only in the UI.
- Audit log and notification events are written.
- Database changes match `database-design.md`.
- Acceptance criteria pass.
- Light/dark mode and responsive layout are verified.
- No plaintext secrets or credentials exist in code or data.
- Tests cover happy path, validation, authorization, and failure cases.

## 15. Glossary

| Term | Meaning |
|---|---|
| IPL | Monthly subscription fee |
| Prorate | Proportional first-month charge |
| Isolir | Service suspension due to non-payment |
| ODP/ODC | Optical Distribution Point / Cabinet |
| ONU | Optical Network Unit at the customer premises |
| GenieACS | TR-069 auto configuration server |
| BHP | Regulatory operating fee |
| USO | Universal Service Obligation |
| COA | Chart of Accounts |
| PO | Purchase Order |
| AR | Accounts Receivable |
| AP | Accounts Payable |

## 16. Reference Documents

- `docs/database-design.md`
- `docs/erd-v2-all.mmd`
- `docs/erd-v2-core.mmd`
- `docs/erd-v2-finance.mmd`
- `docs/erd-v2-hr.mmd`
- `docs/erd-v2-growth.mmd`
- `docs/legacy/PRD.md` (legacy reference)
- `docs/legacy/flows.md` (legacy state machines)
- `docs/legacy/rbac.md` (legacy role findings)
