# MURANET Database Design v2

Normalized database design for the MURANET ISP operations platform, derived
from the legacy e-Billing schema documented in `erd.md`, `data-dictionary.md`,
and `PRD.md`.

## 0. Decisions

| Topic | Decision |
|---|---|
| DBMS | PostgreSQL 15+ |
| Primary key | UUID (`gen_random_uuid()`) |
| Tenancy | Single company for now (no `tenant_id`) |
| Accounting | Full double-entry ledger |
| Scope | All domains |
| Subscription model | One subscription can own many services |
| Timezone | Store `timestamptz` in UTC |
| Money | `numeric(14,2)` in IDR |
| Soft delete | `deleted_at timestamptz` |
| Secrets | `secret_ref` (Vault/KMS), never plaintext |

`tenant_id` is intentionally omitted. If the product becomes multi-company,
add `tenant_id` to every root table and enforce it in every query/policy.

## 1. Naming Conventions

- Tables: plural `snake_case` (`customers`, `payment_allocations`).
- Columns: singular `snake_case` (`customer_id`, `due_date`).
- Primary key: `id uuid`.
- Foreign key: `<singular_table>_id` (`plan_id`, `employee_id`).
- Unique key suffix: `_number`, `_code`, `_key`.
- Booleans: `is_*`, `has_*`, `can_*`.
- Timestamps: `*_at` (`created_at`, `paid_at`, `deleted_at`).
- Dates: `*_date` (`issue_date`, `attendance_date`).
- Money: `amount`, `unit_price`, `total_amount`, `discount_amount`,
  `tax_amount`, `net_salary`.
- Quantities/counts: `quantity`, `*_count`, `*_days`, `*_minutes`.
- Notes/descriptions: `notes`, `description`.
- Reference values: `*_type`, `*_status`, `*_method`.
- Indexes: `idx_<table>_<columns>`.
- Constraints: `ck_<table>_<rule>`, `fk_<table>_<target>`,
  `uk_<table>_<columns>`.
- Attachments: polymorphic `attachments(entity_type, entity_id)` + `files`.
- Legacy traceability: optional `legacy_code text` on migrated root tables.

Avoid legacy abbreviations: `jns_`, `tlp`, `tgl_`, `warga`, `rekening`,
`piutang`, `keterangan`, `nominal`.

## 2. Standard Columns

Every mutable business table should have:

```sql
id            uuid primary key default gen_random_uuid(),
created_at    timestamptz not null default now(),
updated_at    timestamptz not null default now(),
deleted_at    timestamptz,
created_by    uuid references users(id),
updated_by    uuid references users(id)
```

Exceptions: append-only tables (`audit_logs`, `journal_lines`,
`ticket_events`, `point_transactions`, `notification_logs`) do not need
`updated_at`/`deleted_at`.

## 3. Legacy → New Mapping

| Legacy | New |
|---|---|
| `warga` (customer roles) | `customers` + addresses/contacts/identities |
| `warga` (staff roles) | `users` + `employees` |
| `warga` (reseller/agent) | `customers` + `resellers` + `customer_accounts` |
| `lokasi` | `branches` |
| `perusahaan` | `company_profiles` |
| `router` | `routers` |
| `olt` | `olts` |
| `perangkat_pasif` | `passive_devices` |
| `tiang` | `poles` |
| `antena` | `antennas` |
| `tunnel` | `tunnels` |
| `genieacs` | `acs_servers` |
| `tipe_pembayaran` | `plans` + `plan_prices` + `plan_branches` |
| `langganan` (derived) | `subscriptions` + `services` |
| `diskon*` | `discounts` + `discount_scopes` |
| `tagihan` | `invoices` + `invoice_items` |
| `pembayaran`, `data-ipl` | `payments` + `payment_allocations` |
| `setor` | `sales_deposits` |
| `deposit` | `deposits` + `deposit_transactions` |
| `pemasukan` | `incomes` (+ journal entry) |
| `pengeluaran` | `expenses` (+ journal entry) |
| `mutasi` | `journal_entries` + `journal_lines` |
| `akun`, `kategori_akun` | `chart_of_accounts`, `account_types` |
| `rekening` | `bank_accounts` |
| `ticket`, `ticket_detail` | `tickets`, `ticket_events` |
| `installasi` | `installation_reports`, `ticket_devices` |
| `master_gaji` | `employee_salary_profiles` |
| `absensi` | `attendance_records` |
| `lembur` | `overtime_requests` |
| `cuti` | `leave_requests` |
| `tunjangan` | `employee_allowances` |
| `pemotongan` | `employee_deductions` |
| `piutang_karyawan` | `employee_loans` |
| `payroll_periode` | `payroll_periods` |
| `gaji_bulanan` | `payslips` |
| `pekerjaan_harian` | `daily_activities` |
| `petty_cash` | `petty_cash_funds` + `petty_cash_expenses` |
| `rembursment` | `reimbursements` |
| `payment_request` | `payment_requests` |
| `contact` | `contacts` |
| `po` | `purchase_orders` + `purchase_order_items` |
| `voucher_harga` | `voucher_products` |
| `voucher_item` | `vouchers` |
| `penjualan_voucher` | `voucher_sales` |
| `setor_voucher` | `voucher_deposits` |
| `poin_pengaturan` | `point_rules` |
| `poin_saldo` | `point_balances` |
| `poin_hadiah` | `rewards` |
| `poin_penukaran` | `reward_redemptions` |
| `notifikasi_template` | `notification_templates` |
| `wa_device` | `whatsapp_devices` |
| `telegram_group` | `telegram_groups` |
| `mail_server` | `mail_settings` |
| `pengumuman` | `announcements` |
| `log_aktivitas` | `audit_logs` |
| `jns_*` | `*_type` |
| `tlp` / `telp` | `phone` |
| `tgl_*` | `*_date` |
| `keterangan` | `notes` / `description` |
| `nominal` | `amount` |
| `nama_*` denormalized | removed, use joins/views |

Data cleaning during migration:

1. Drop legacy plaintext passwords; force password reset.
2. Normalize phone numbers to E.164 (`+62...`).
3. Deduplicate NIK/phone; produce a conflict report.
4. Map free-text enums to canonical values.
5. Convert base64 legacy IDs to UUID; keep `legacy_code` for traceability.
6. Move uploaded files to object storage; store `files.storage_key`.
7. Recompute denormalized balances from the ledger; never migrate cached totals.

## 4. Domains and Tables

Standard columns are implied unless noted.

### 4.1 Company, Branch, Identity & RBAC

| Table | Purpose | Key columns |
|---|---|---|
| `company_profiles` | Singleton company profile | `name`, `legal_name`, `logo_file_id`, `address`, `phone`, `email`, `tax_number`, `invoice_prefix`, `bhp_rate`, `uso_rate`, `isp_fee_rate` |
| `branches` | Old `lokasi` / business units | `code`, `name`, `address`, `phone`, `is_head_office`, `is_active` |
| `users` | Staff login accounts | `username`, `email`, `password_hash`, `is_active`, `last_login_at` |
| `roles` | Canonical roles | `code`, `name`, `is_system` |
| `permissions` | Permission catalog | `code`, `name`, `module` |
| `role_permissions` | Role → permission | `role_id`, `permission_id` |
| `user_roles` | User → role, optional branch scope | `user_id`, `role_id`, `branch_id` |
| `user_branches` | Data scope per user | `user_id`, `branch_id`, `is_primary` |
| `employees` | Staff profile (1:1 user) | `user_id`, `branch_id`, `employee_number`, `full_name`, `phone`, `hire_date`, `end_date`, `position`, `status`, `photo_file_id` |
| `customer_accounts` | Customer app login | `customer_id`, `email`, `phone`, `password_hash`, `is_active`, `last_login_at` |
| `audit_logs` | Append-only audit trail | `user_id`, `action`, `entity_type`, `entity_id`, `before_data`, `after_data`, `ip_address`, `user_agent` |

Notes:

- `users` is staff-only. Customers use `customer_accounts`.
- Role + branch scope must be checked server-side, not from menu visibility.
- 24 legacy levels map to canonical roles (owner, branch_manager, admin,
  cs, sales, technician, noc, hrd, warehouse, customer).

### 4.2 Customers

| Table | Purpose | Key columns |
|---|---|---|
| `customers` | Master customer | `branch_id`, `customer_number`, `full_name`, `customer_type`, `status`, `sales_employee_id`, `registered_at`, `notes` |
| `customer_addresses` | Multiple addresses | `customer_id`, `address_type`, `address_line`, `village`, `district`, `city`, `province`, `postal_code`, `latitude`, `longitude`, `is_primary` |
| `customer_contacts` | Phone/WA/email | `customer_id`, `contact_type`, `value`, `is_primary`, `is_verified` |
| `customer_identities` | KTP/NIK/NPWP/passport | `customer_id`, `identity_type`, `identity_number`, `file_id` |
| `customer_status_history` | Status changes | `customer_id`, `status`, `reason`, `changed_by`, `changed_at` |
| `resellers` | Reseller/agent profile | `customer_id`, `reseller_code`, `deposit_balance`, `commission_method`, `commission_value`, `is_active` |

Constraints:

- `customers.customer_number` unique.
- `customer_identities.identity_number` unique where `deleted_at is null`.
- Phone uniqueness is enforced after normalization; store digits only + country code.
- NIK is unique except for corporate customers.

### 4.3 Plans, Prices, Discounts & Subscriptions

| Table | Purpose | Key columns |
|---|---|---|
| `plans` | Old `tipe_pembayaran` | `code`, `name`, `description`, `connection_type`, `billing_type`, `is_active` |
| `plan_prices` | Price history | `plan_id`, `price`, `is_taxable`, `effective_from`, `effective_to` |
| `plan_branches` | Plan availability | `plan_id`, `branch_id` |
| `discounts` | Discount definition | `code`, `name`, `method`, `value`, `starts_at`, `ends_at`, `is_active` |
| `discount_scopes` | 5 legacy scopes in one table | `discount_id`, `scope_type`, `branch_id`, `plan_id`, `customer_id` |
| `subscriptions` | Customer subscription | `customer_id`, `plan_id`, `branch_id`, `discount_id`, `sales_employee_id`, `status`, `start_date`, `end_date`, `due_day`, `prorate_enabled`, `tax_enabled`, `price_snapshot` |
| `subscription_status_history` | Status/suspension history | `subscription_id`, `status`, `reason`, `changed_by`, `changed_at` |
| `services` | Network services per subscription | `subscription_id`, `service_type`, `username`, `router_id`, `olt_id`, `passive_device_id`, `status`, `installed_at`, `terminated_at` |
| `service_credentials` | PPPoE/hotspot credentials | `service_id`, `credential_type`, `username`, `password_hash`, `secret_ref`, `is_active` |

Design notes:

- `plan_prices` prevents historical invoices from changing when prices change.
- `subscriptions.price_snapshot` freezes the price at subscription time.
- `discount_scopes.scope_type` values: `all`, `branch`, `plan`,
  `plan_branch`, `customer`. Exactly one target column is populated.
- `subscriptions.due_day` is 1–31; clamp to the last day of shorter months.
- One subscription may have multiple services (internet, IPTV, static IP).
- Prorate and tax are per subscription, matching legacy behavior.

### 4.4 Network & Inventory

| Table | Purpose | Key columns |
|---|---|---|
| `routers` | MikroTik routers | `branch_id`, `name`, `host`, `api_port`, `username`, `secret_ref`, `is_active`, `last_seen_at` |
| `olts` | OLT devices | `branch_id`, `name`, `vendor`, `model`, `host`, `telnet_port`, `snmp_port`, `snmp_version`, `username`, `secret_ref`, `is_active` |
| `poles` | Utility poles | `branch_id`, `code`, `name`, `latitude`, `longitude`, `address`, `photo_file_id` |
| `passive_devices` | ODP/ODC/splitter/switch/OTB/joint closure | `branch_id`, `device_type`, `code`, `name`, `parent_device_id`, `olt_id`, `pole_id`, `capacity`, `used_capacity`, `latitude`, `longitude`, `address`, `photo_file_id` |
| `antennas` | Radio/AP | `router_id`, `branch_id`, `mac`, `ip`, `ssid`, `frequency`, `channel`, `secret_ref`, `location`, `notes` |
| `tunnels` | VPN tunnels | `router_id`, `name`, `username`, `secret_ref`, `is_active` |
| `acs_servers` | GenieACS / TR-069 | `name`, `base_url`, `username`, `secret_ref`, `is_active` |
| `inventory_items` | Serialized inventory | `branch_id`, `sku`, `name`, `category`, `serial_number`, `mac`, `status`, `purchase_price`, `purchased_at`, `current_value`, `notes` |
| `inventory_movements` | Stock movements | `inventory_item_id`, `movement_type`, `reference_type`, `reference_id`, `from_branch_id`, `to_branch_id`, `employee_id`, `quantity`, `unit_price`, `occurred_at`, `notes`, `photo_file_id` |

Notes:

- `passive_devices.parent_device_id` models ODC → ODP topology.
- `used_capacity` is maintained transactionally; reports may recompute it.
- `inventory_items` is serialized (1 row per device), so `ticket_devices`
  references the exact item.
- All device credentials use `secret_ref`, never plaintext columns.

### 4.5 Billing & Payments

| Table | Purpose | Key columns |
|---|---|---|
| `invoices` | Invoice header | `branch_id`, `customer_id`, `subscription_id`, `invoice_number`, `period_start`, `period_end`, `issue_date`, `due_date`, `subtotal`, `discount_total`, `tax_total`, `total`, `paid_amount`, `status`, `notes` |
| `invoice_items` | Invoice lines | `invoice_id`, `item_type`, `reference_type`, `reference_id`, `description`, `quantity`, `unit_price`, `discount_amount`, `tax_amount`, `total` |
| `payments` | Payment header | `branch_id`, `customer_id`, `bank_account_id`, `payment_number`, `payment_method`, `amount`, `status`, `paid_at`, `verified_by`, `verified_at`, `external_reference`, `notes` |
| `payment_allocations` | Payment → invoice allocation | `payment_id`, `invoice_id`, `amount` |
| `payment_proofs` | Proof of payment | `payment_id`, `file_id`, `uploaded_by`, `uploaded_at` |
| `deposits` | Customer deposit balance | `customer_id`, `deposit_type`, `balance`, `status` |
| `deposit_transactions` | Deposit mutations | `deposit_id`, `transaction_type`, `amount`, `reference_type`, `reference_id`, `occurred_at`, `notes` |
| `sales_deposits` | Sales cash settlement | `employee_id`, `bank_account_id`, `period_start`, `period_end`, `amount_due`, `amount_paid`, `status`, `proof_file_id`, `verified_by`, `verified_at` |
| `payment_gateway_configs` | Provider config | `provider`, `merchant_code`, `secret_ref`, `fee_bearer`, `is_active` |
| `payment_gateway_transactions` | PG transaction log | `payment_id`, `payment_gateway_config_id`, `provider`, `external_id`, `status`, `amount`, `fee_amount`, `callback_payload` |

Notes:

- Invoice status: `draft`, `issued`, `partial`, `paid`, `overdue`, `void`.
- Payment status: `pending`, `verified`, `rejected`, `void`.
- `payment_allocations` supports partial payments and one payment covering
  multiple invoices.
- Unique constraint prevents duplicate invoice per subscription per period.
- PG callback must be idempotent on `(provider, external_id)`.

### 4.6 Ticketing & Field Work

| Table | Purpose | Key columns |
|---|---|---|
| `ticket_categories` | Old 20 `jns_laporan` | `code`, `name`, `is_active` |
| `tickets` | Ticket header | `branch_id`, `customer_id`, `subscription_id`, `ticket_number`, `ticket_type`, `category_id`, `status`, `priority`, `subject`, `description`, `reported_at`, `first_response_at`, `resolved_at`, `closed_at`, `created_by` |
| `ticket_events` | Append-only history | `ticket_id`, `event_type`, `status`, `notes`, `actor_id`, `metadata` |
| `ticket_assignments` | Up to N technicians | `ticket_id`, `employee_id`, `assignment_role`, `assigned_at`, `unassigned_at` |
| `ticket_schedules` | Installation schedule | `ticket_id`, `scheduled_date`, `time_slot`, `employee_id`, `status`, `notes` |
| `ticket_devices` | Devices used/returned | `ticket_id`, `inventory_item_id`, `action`, `quantity`, `notes` |
| `installation_reports` | Old `berita_acara` | `ticket_id`, `report_number`, `signed_by`, `signature_file_id`, `photo_file_id`, `notes`, `completed_at` |

Notes:

- Ticket status: `open`, `in_progress`, `pending`, `scheduled`,
  `installation_success`, `installation_failed`, `closed`.
- `ticket_events` is append-only; corrections create a new event.
- General tickets have `customer_id` and `subscription_id` null.
- SLA fields can be added as `sla_due_at`, `first_response_at`, `resolved_at`.

### 4.7 Finance & Double-Entry Accounting

| Table | Purpose | Key columns |
|---|---|---|
| `bank_accounts` | Cash/bank accounts | `branch_id`, `name`, `account_number`, `account_holder`, `is_visible_broadband`, `is_visible_corporate`, `opening_balance`, `is_active` |
| `account_types` | COA classification | `code`, `name`, `normal_balance` |
| `chart_of_accounts` | COA | `code`, `name`, `account_type_id`, `parent_id`, `is_active` |
| `journal_entries` | Journal header | `branch_id`, `entry_number`, `entry_date`, `description`, `source_type`, `source_id`, `status`, `posted_by`, `posted_at` |
| `journal_lines` | Journal lines | `journal_entry_id`, `account_id`, `debit`, `credit`, `memo` |
| `incomes` | Non-subscription income | `branch_id`, `bank_account_id`, `contact_id`, `income_type`, `amount`, `description`, `received_at`, `proof_file_id`, `journal_entry_id` |
| `expenses` | Expenses | `branch_id`, `bank_account_id`, `contact_id`, `expense_type`, `amount`, `description`, `paid_at`, `proof_file_id`, `journal_entry_id` |
| `petty_cash_funds` | Petty cash fund | `fund_number`, `bank_account_id`, `custodian_employee_id`, `amount`, `used_amount`, `balance`, `status` |
| `petty_cash_expenses` | Petty cash usage | `fund_id`, `contact_id`, `amount`, `description`, `spent_at`, `attachment_file_id`, `status` |
| `reimbursements` | Reimbursement | `reimbursement_number`, `bank_account_id`, `contact_id`, `amount`, `description`, `status`, `attachment_file_id`, `journal_entry_id`, `requested_by`, `approved_by`, `paid_at` |
| `payment_requests` | Payment request | `request_number`, `bank_account_id`, `contact_id`, `amount`, `description`, `status`, `attachment_file_id`, `requested_by`, `approved_by`, `paid_at` |
| `contacts` | Vendor/employee/customer contact | `contact_type`, `name`, `email`, `phone`, `company`, `balance`, `is_active` |
| `purchase_orders` | PO / quotation header | `po_number`, `contact_id`, `order_date`, `expected_date`, `status`, `total_amount`, `notes`, `created_by`, `approved_by` |
| `purchase_order_items` | PO lines | `purchase_order_id`, `description`, `quantity`, `unit_price`, `tax_amount`, `total` |

Rules:

- Every financial document posts a balanced `journal_entries` +
  `journal_lines` pair (sum debit = sum credit).
- `journal_entries.status`: `draft`, `posted`, `void`.
- Source documents store `journal_entry_id` for traceability.
- Account balances are derived from `journal_lines`; use a materialized view
  or periodic snapshot for reporting.
- Never store a user-editable running balance on `chart_of_accounts`.

### 4.8 HR, Attendance & Payroll

| Table | Purpose | Key columns |
|---|---|---|
| `employee_salary_profiles` | Salary master (1:1 employee) | `employee_id`, `default_shift_id`, `base_salary`, `meal_allowance_daily`, `transport_allowance_daily`, `overtime_rate_hourly`, `annual_leave_days`, `remaining_leave_days`, `bank_name`, `bank_account_number`, `effective_from`, `effective_to` |
| `shifts` | Shift + geofence | `branch_id`, `code`, `name`, `is_multi_shift`, `start_time`, `end_time`, `check_in_latitude`, `check_in_longitude`, `check_out_latitude`, `check_out_longitude`, `radius_m`, `is_active` |
| `attendance_records` | Attendance | `employee_id`, `shift_id`, `attendance_date`, `check_in_at`, `check_out_at`, `late_minutes`, `work_minutes`, `attendance_type`, `check_in_photo_file_id`, `check_out_photo_file_id`, `check_in_latitude`, `check_in_longitude`, `check_out_latitude`, `check_out_longitude`, `check_in_distance_m`, `check_out_distance_m`, `notes` |
| `overtime_requests` | Overtime | `employee_id`, `overtime_date`, `start_at`, `end_at`, `minutes`, `amount`, `status`, `approved_by`, `approved_at`, `notes` |
| `leave_requests` | Leave/permit | `employee_id`, `leave_type`, `start_date`, `end_date`, `days`, `reason`, `attachment_file_id`, `status`, `approved_by`, `approved_at` |
| `employee_allowances` | Recurring/one-time allowance | `employee_id`, `name`, `allowance_type`, `amount`, `effective_from`, `effective_to`, `is_active` |
| `employee_deductions` | Recurring/one-time deduction | `employee_id`, `name`, `deduction_type`, `amount`, `effective_from`, `effective_to`, `is_active` |
| `employee_loans` | Employee loan | `employee_id`, `amount`, `remaining_amount`, `installment_amount`, `status`, `loan_date`, `notes`, `approved_by` |
| `payroll_periods` | Payroll cut-off | `code`, `start_date`, `end_date`, `status`, `closed_by`, `closed_at` |
| `payslips` | Payroll result | `employee_id`, `payroll_period_id`, `working_days`, `leave_days`, `absent_days`, `overtime_minutes`, `meal_transport_allowance`, `overtime_pay`, `other_allowance`, `gross_salary`, `total_deductions`, `loan_deduction`, `net_salary`, `status`, `paid_at` |
| `daily_activities` | Daily activity report | `employee_id`, `activity_date`, `activity_name`, `description`, `photo_file_id` |

Rules:

- `payslips` unique on `(employee_id, payroll_period_id)`.
- `attendance_records` unique on `(employee_id, attendance_date, shift_id)`.
- Overtime must be approved before entering payroll.
- Payroll periods lock after payment; corrections create adjustment entries.

### 4.9 Vouchers, Resellers & Loyalty

| Table | Purpose | Key columns |
|---|---|---|
| `voucher_products` | Hotspot voucher product | `branch_id`, `router_id`, `code`, `name`, `sell_price`, `buy_price`, `hotspot_profile`, `script_on_login`, `is_active` |
| `vouchers` | Generated voucher item | `voucher_product_id`, `voucher_code`, `username`, `password_hash`, `status`, `generated_at`, `sold_at`, `expires_at`, `bytes_in`, `bytes_out` |
| `voucher_sales` | Voucher sale | `voucher_id`, `reseller_id`, `sell_price`, `buy_price`, `profit`, `customer_phone`, `sold_at`, `status`, `payment_method` |
| `voucher_deposits` | Reseller deposit | `reseller_id`, `amount`, `deposited_at`, `received_by`, `proof_file_id`, `notes` |
| `point_rules` | Point earning rule | `name`, `description`, `points`, `condition_type`, `condition_value`, `branch_id`, `is_active` |
| `point_balances` | Customer point balance | `customer_id`, `balance`, `updated_at` |
| `point_transactions` | Point mutations | `customer_id`, `point_rule_id`, `transaction_type`, `points`, `reference_type`, `reference_id`, `description`, `created_at` |
| `rewards` | Reward catalog | `name`, `description`, `points_required`, `stock`, `photo_file_id`, `branch_id`, `is_active` |
| `reward_redemptions` | Redemption request | `reward_id`, `customer_id`, `points`, `status`, `requested_at`, `fulfilled_at`, `handled_by`, `pickup_photo_file_id`, `notes` |

Rules:

- `vouchers.voucher_code` and `vouchers.username` unique.
- Voucher stock decreases at generation, not at sale.
- Points are credited only after payment verification.
- Point balance updates must be transactional with `point_transactions`.

### 4.10 Notifications, Files & System

| Table | Purpose | Key columns |
|---|---|---|
| `notification_templates` | Event templates | `event_code`, `channel`, `subject`, `body`, `is_active` |
| `announcements` | Customer announcements | `title`, `content`, `media`, `target_type`, `target_filter`, `published_at`, `expires_at`, `created_by`, `status` |
| `notification_logs` | Delivery log | `channel`, `provider`, `recipient`, `template_id`, `status`, `sent_at`, `error_message`, `payload` |
| `whatsapp_devices` | WA gateway devices | `name`, `phone_number`, `provider`, `secret_ref`, `status`, `last_seen_at` |
| `telegram_groups` | Telegram groups | `name`, `chat_id`, `purpose`, `is_active` |
| `mail_settings` | SMTP config | `host`, `port`, `username`, `secret_ref`, `from_name`, `from_email`, `is_active` |
| `files` | Object storage metadata | `storage_key`, `file_name`, `mime_type`, `size_bytes`, `checksum`, `uploaded_by` |
| `attachments` | Polymorphic attachment link | `file_id`, `entity_type`, `entity_id` |
| `system_settings` | Key-value settings | `setting_key`, `setting_value`, `description`, `updated_by` |
| `integration_logs` | External integration log | `integration`, `direction`, `reference_type`, `reference_id`, `request_payload`, `response_payload`, `status`, `error_message` |

## 5. Canonical Reference Values

| Field | Values |
|---|---|
| `customers.customer_type` | `residential`, `business` |
| `customers.status` | `active`, `suspended`, `terminated`, `inactive` |
| `plans.connection_type` | `pppoe`, `hotspot`, `static`, `iptv`, `other` |
| `plans.billing_type` | `monthly`, `non_monthly` |
| `subscriptions.status` | `active`, `suspended`, `terminated` |
| `services.status` | `provisioned`, `active`, `suspended`, `terminated` |
| `invoices.status` | `draft`, `issued`, `partial`, `paid`, `overdue`, `void` |
| `payments.status` | `pending`, `verified`, `rejected`, `void` |
| `payments.payment_method` | `cash`, `bank_transfer`, `payment_gateway`, `deposit` |
| `deposits.deposit_type` | `credit`, `security` |
| `tickets.ticket_type` | `customer`, `general` |
| `tickets.status` | `open`, `in_progress`, `pending`, `scheduled`, `installation_success`, `installation_failed`, `closed` |
| `tickets.priority` | `low`, `normal`, `high`, `urgent` |
| `journal_entries.status` | `draft`, `posted`, `void` |
| `account_types.normal_balance` | `debit`, `credit` |
| `employees.status` | `active`, `inactive`, `terminated` |
| `attendance_records.attendance_type` | `present`, `permit`, `sick`, `leave`, `absent`, `overtime` |
| `leave_requests.leave_type` | `annual`, `sick`, `permit` |
| `payslips.status` | `draft`, `approved`, `paid` |
| `vouchers.status` | `available`, `sold`, `expired`, `void` |
| `reward_redemptions.status` | `pending`, `approved`, `rejected`, `fulfilled` |

## 6. Index & Constraint Recommendations

- Index every foreign key.
- `customers(customer_number)` unique; `customers(branch_id, status)`.
- `customer_contacts(value)` for phone search.
- `customer_identities(identity_number)` unique partial where not deleted.
- `subscriptions(customer_id, status)`; `subscriptions(branch_id, status)`.
- `invoices(invoice_number)` unique;
  `invoices(customer_id, status)`;
  unique `(subscription_id, period_start, period_end)` where not void.
- `payments(payment_number)` unique;
  `payment_allocations(payment_id, invoice_id)` unique.
- `payment_gateway_transactions(provider, external_id)` unique.
- `tickets(ticket_number)` unique; `tickets(branch_id, status)`.
- `ticket_events(ticket_id, created_at)`.
- `journal_entries(entry_number)` unique;
  `journal_lines(account_id)`;
  check exactly one of `debit`/`credit` > 0 per line.
- `attendance_records(employee_id, attendance_date, shift_id)` unique.
- `payslips(employee_id, payroll_period_id)` unique.
- `vouchers(voucher_code)` unique; `vouchers(username)` unique.
- `points_transactions(customer_id, created_at)`.
- `audit_logs(entity_type, entity_id)`, `audit_logs(created_at)`.

## 7. Security & Data Handling

- Staff passwords: Argon2id.
- Customer passwords: Argon2id.
- Device/gateway/mail credentials: `secret_ref` to Vault/KMS; never plaintext.
- PII (`customer_identities`, photos) restricted by role; files via signed URL.
- `audit_logs` append-only and immutable.
- Soft delete on business tables; hard delete only for GDPR/retention jobs.
- All authorization checks server-side; role/branch scope enforced in queries.
- Database backup daily + PITR; financial retention 10 years.

## 8. Migration Plan

1. Export legacy tables and files.
2. Build mapping tables for roles, plans, branches, enum values.
3. Create `users` + `employees` from staff `warga` rows.
4. Create `customers` from customer `warga` rows; split addresses, contacts,
   identities, subscriptions, services.
5. Migrate packages → `plans` + `plan_prices`; discounts → `discounts`.
6. Migrate invoices/payments; create allocations from legacy links.
7. Rebuild ledger from cash/bank source documents.
8. Migrate tickets, devices, installations.
9. Migrate payroll and attendance.
10. Migrate vouchers, points, notifications, settings.
11. Reconcile: invoice totals, outstanding balances, ledger balances,
    customer counts per branch, active subscriptions.
12. Dual-run for 1–2 billing cycles before cut-over.

## 9. ERD Files

- `erd-v2-core.mmd` — company, identity, customers, plans, subscriptions,
  network, tickets, platform.
- `erd-v2-finance.mmd` — billing, payments, deposits, double-entry accounting.
- `erd-v2-hr.mmd` — employees, shifts, attendance, payroll.
- `erd-v2-growth.mmd` — resellers, vouchers, loyalty, notifications.
- `erd-v2-all.mmd` — combined ERD of all v2 domains.

## 10. Assumptions

- Single company deployment; `branch_id` is the main data scope.
- One customer may have multiple subscriptions and services.
- Price changes are handled through `plan_prices`, not by editing invoices.
- Full double-entry is required from day one.
- Legacy base64 IDs are not reused; UUID is the new identity.
- The legacy behavior for prorate, PPN, and incentives is preserved but should
  be verified against real billing cycles before go-live.
