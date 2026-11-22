# 03 — Customers Completion Report

## Metadata

| Field | Value |
|---|---|
| PRD | `docs/prd/03-customers-prd.md` |
| Branch | `feat/customers` |
| Commit | `eb89f0a` |
| Status | Prototype complete |
| Verification | `npm run lint` only |

## Delivered

### Customer list

- Search, branch filter, status filter, and client-side pagination.
- Stats: total customers, active, suspended, total outstanding.
- CSV export from the active filter.
- Row actions: view detail and activate/deactivate.

### Customer wizard

- Four steps: identity, address, network, review.
- Draft save and resume.
- Duplicate detection by normalized phone and NIK.
- Duplicate override confirmation.
- Customer creation and redirect to detail.
- shadcn Select for customer type, branch, plan, and sales.

### Customer detail

- Profile card, contact, identity, and address.
- Subscription summary and service table.
- Billing table, ticket table, and network table.
- Edit dialog and activate/deactivate confirmation.

### Import and segments

- Import wizard: upload, preview validation, commit.
- Mock preview with valid/warning/error rows.
- Import commit adds customers to the store.
- Customer segments: list, create, and delete.

### Technical

- Zustand customer store with customers, segments, drafts, invoices, tickets,
  and services.
- Hooks: `useCustomersPage`, `useCustomerWizard`, `useCustomerDetail`,
  `useCustomerImport`, `useCustomerSegments`.
- Reusable DataTable across list/detail/import.
- Icon actions with tooltips.
- Shared ConfirmationDialog.

## User revisions applied

- Zustand state management.
- PascalCase component files and camelCase hooks.
- No atomic design or unnecessary `parts/` folders.
- shadcn Select for all dropdowns.
- Reusable DataTable with column mapping.
- shadcn Pagination through DataTablePagination.
- Icon-only table actions with tooltips and `aria-label`.
- Shared ConfirmationDialog.
- Lint-only verification.

## Known limitations

- Import uses simulated preview rows; no real CSV/XLSX parser.
- Export is client-side CSV.
- Customer merge is not implemented.
- Customer 360 invoices, tickets, and services are read from their feature
  stores, not duplicated in the customer store.

## Phase 1 ERD alignment

- `customers` is now a header-only entity: `branch_id`, `sales_employee_id`,
  `customer_number`, `full_name`, `customer_type`, `status`,
  `registered_at`, `notes`.
- Added child entities: `customer_addresses`, `customer_contacts`,
  `customer_identities`, `customer_status_history`, and `customer_accounts`.
- Wizard now collects customers in separate steps and creates the initial
  subscription through the subscription store.
- Detail page has tabs for alamat, kontak & identitas, riwayat status, akun
  portal, langganan, tagihan, tiket, and jaringan.
- Customer list and detail derive plan, outstanding, and due day from the
  subscription and billing stores.
- Added employee directory (`src/features/users/data/employees.ts`) for
  `sales_employee_id`.
- Persisted customer store key bumped to `muranet-customers-v2` because the
  entity shape changed.
