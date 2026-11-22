# 03 — Customers PRD

## Metadata

| Field | Value |
|---|---|
| Document ID | PRD-03 |
| Version | 1.0 |
| Status | Draft |
| Phase | 1 |
| Dependencies | PRD-01, PRD-02 |
| Related tables | `customers`, `customer_addresses`, `customer_contacts`, `customer_identities`, `customer_status_history`, `customer_accounts`, `files` |
| Related ERD | `erd-v2-core.mmd` |

## 1. Summary & Goals

Replace the legacy 67-field single form with a guided customer master. A
customer is a person or business; subscriptions and services are separate
entities owned by the customer.

### Goals

- Guided 4-step create wizard with draft support.
- Clean separation of identity, address, contacts, and network data.
- Duplicate detection before creation.
- Import/export with validation and dry-run.
- Customer 360 view.
- Status lifecycle with history.
- Saved segments for operations and notifications.

### Non-goals

- Subscription creation (PRD-05).
- Network provisioning (PRD-06).
- Billing (PRD-07).
- Customer portal (deferred).

## 2. Actors & Permissions

| Actor | Capabilities |
|---|---|
| `owner`, `admin` | Full customer CRUD, import/export, all branches |
| `branch_manager` | CRUD within branch, import/export within branch |
| `cs` | Create/update within branch, read 360 |
| `sales` | Create customers assigned to self, read own |
| `technician`, `noc` | Read customer + service/network context |
| `finance` | Read customer and billing context |

Permissions:

```txt
customer.read, customer.create, customer.update, customer.deactivate
customer.import, customer.export
customer.segment.manage
```

## 3. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| CUST-01 | Create customer through a 4-step wizard: identity, address, network, review. | M |
| CUST-02 | Each step can be saved as a draft and resumed later. | M |
| CUST-03 | Customer number is auto-generated and unique. | M |
| CUST-04 | Duplicate detection checks normalized phone, NIK, and name + branch. | M |
| CUST-05 | Customer can have multiple addresses, contacts, and identities. | M |
| CUST-06 | Primary address and primary contact are required. | M |
| CUST-07 | Customer status changes are recorded with reason and actor. | M |
| CUST-08 | Deactivation requires a reason; history and financial data are retained. | M |
| CUST-09 | Import supports Excel/CSV with per-row validation, dry-run, and error report. | M |
| CUST-10 | Export respects active filters and selected columns. | M |
| CUST-11 | Customer 360 shows profile, subscriptions, services, invoices, payments, tickets, devices, points. | S |
| CUST-12 | Saved segments can be reused by notifications and reports. | S |
| CUST-13 | Corporate customers can have multiple service locations. | C |
| CUST-14 | Every mutation is audited. | M |

## 4. Workflows

### WF-CUST-01 — Create customer wizard

- Actors: `cs`, `admin`, `branch_manager`, `sales`
- Permissions: `customer.create`
- Trigger: "Add customer"
- Preconditions: branch active, plan available (if network step is used)
- Idempotency: client `draft_id` to prevent double submit

Steps:

1. **Step 1 — Identity**: full name, customer type (residential/business),
   NIK/NPWP/passport, photo, notes.
2. Validate identity format and uniqueness.
3. **Step 2 — Address**: primary address, village, district, city, province,
   postal code, coordinates, optional billing/installation addresses.
4. **Step 3 — Network**: plan, branch, router/ODP/service type, sales owner,
   due day, prorate, tax. This step may be skipped and completed later in
   PRD-05.
5. **Step 4 — Review**: show all data, duplicates, calculated price/prorate.
6. Submit: create customer + addresses + contacts + identities in one
   transaction.
7. If network step was completed, create subscription + service draft.
8. Generate customer number via WF-FND-04.
9. Write audit `customer.created`.
10. Send welcome notification (if configured).
11. Redirect to customer 360.

Validation:

- `full_name` required, 3–200 chars.
- Phone normalized to `+62`; at least one phone required.
- NIK/NPWP required for residential/business respectively (configurable).
- Coordinates optional but recommended.
- Branch must be active and within actor scope.
- Plan must be available at the selected branch.

Failure cases:

- Duplicate detected → show candidates; block or require override with reason.
- Plan unavailable → block Step 3.
- Provisioning fails → customer saved; subscription/service remains `draft`.
- Transaction failure → nothing is saved.

Acceptance:

```gherkin
Given a CS user in branch JKT-01
When they complete the 4-step wizard with valid data
Then a customer is created with a unique customer number
And addresses, contacts, and identities are stored separately
And customer.created is audited
```

### WF-CUST-02 — Save draft and resume

- Actors: customer creators
- Trigger: "Save draft"

Steps:

1. Persist wizard state under `customer_drafts` or a `draft` customer row.
2. Validate only fields present so far.
3. Store the actor, branch, and `draft_id`.
4. On resume, reload the draft and continue from the last step.
5. Drafts expire after a configurable period (default 14 days).

Rules:

- Drafts do not reserve customer numbers.
- Duplicate check reruns on final submission.

### WF-CUST-03 — Duplicate detection and merge suggestion

- Actors: system
- Trigger: create/import/edit

Steps:

1. Normalize phone, NIK, and name.
2. Search exact phone/NIK and fuzzy name within branch.
3. Return candidates with match reasons and confidence.
4. If a high-confidence match exists, block creation.
5. Allow override only with `duplicate_override_reason` and permission.
6. For imports, mark the row as a duplicate conflict.

Match rules:

- Exact NIK → high confidence.
- Exact normalized phone → high confidence.
- Same name + same branch + similar address → medium confidence.

### WF-CUST-04 — Update customer

- Actors: `cs`, `admin`, `branch_manager`
- Permissions: `customer.update`

Steps:

1. Load customer and verify branch scope.
2. Edit identity, addresses, contacts, or notes.
3. Validate changed fields; rerun duplicate checks when phone/NIK changes.
4. Save in a transaction; write field-level audit `customer.updated`.
5. Invalidate customer caches.

Rules:

- Customer number is immutable.
- Address/contact history is retained; do not silently overwrite the only
  primary record without creating a new one.
- Changing branch requires a dedicated transfer workflow (see open questions).

### WF-CUST-05 — Deactivate/reactivate customer

- Actors: `admin`, `branch_manager`
- Permissions: `customer.deactivate`

Steps:

1. Request deactivation with reason.
2. Block if active subscriptions exist unless the actor confirms service
   termination (PRD-05).
3. Set customer status `inactive`, write status history.
4. Audit `customer.deactivated`.
5. Reactivation restores `active`, writes history, and requires a reason.
6. Billing history and invoices are never deleted.

### WF-CUST-06 — Import dry-run and commit

- Actors: `admin`, `branch_manager`, `cs` (branch)
- Permissions: `customer.import`
- Trigger: upload Excel/CSV

Steps:

1. Upload template file (WF-FND-05).
2. Parse rows and validate schema.
3. For each row: required fields, phone/NIK format, branch scope, plan
   availability, duplicates.
4. Produce a dry-run report: valid, warning, error, duplicate.
5. Allow downloading the error report.
6. Commit only valid rows (or all-or-nothing, configurable).
7. Generate customer numbers transactionally.
8. Audit `customer.imported` with counts and file id.
9. Send completion notification.

Rules:

- Dry-run never writes business data.
- Commit is idempotent per `import_id`.
- Max rows per batch from settings (default 5,000).
- Failed rows never partially create a customer.

### WF-CUST-07 — Export

- Actors: `admin`, `branch_manager`, `finance`
- Permissions: `customer.export`

Steps:

1. Apply current filters and selected columns.
2. Enforce branch scope.
3. Generate file asynchronously if rows exceed threshold.
4. Store file in `files`, notify when ready.
5. Audit `customer.exported`.

Rules:

- PII columns require explicit permission.
- Export file expires after 24 hours.

### WF-CUST-08 — Customer 360 view

- Actors: customer-facing roles
- Trigger: open customer detail

Steps:

1. Load profile, addresses, contacts, and identities.
2. Load active/past subscriptions and services.
3. Load invoices, payments, outstanding balance.
4. Load tickets and installations.
5. Load devices and points (if modules enabled).
6. Render tabs with lazy loading and independent error states.

Rules:

- Financial data masked for roles without finance permission.
- PII access is audited for sensitive fields.

### WF-CUST-09 — Saved segment

- Actors: `admin`, `marketing`, `finance`
- Permissions: `customer.segment.manage`

Steps:

1. Build a filter (branch, plan, status, due day, unpaid, inactive, etc.).
2. Preview count and sample rows.
3. Save segment with name and owner.
4. Segment can be used by notifications (PRD-11) and reports (PRD-12).
5. Segments are dynamic by default; optional snapshot mode.

## 5. State Models

### Customer

`draft` → `active` → `suspended` → `terminated` / `inactive`

### Import batch

`uploaded` → `validated` → `committed` / `failed`

## 6. Data References

- `customers`, `customer_addresses`, `customer_contacts`,
  `customer_identities`, `customer_status_history`, `customer_accounts`
- `files`, `attachments`
- `subscriptions`, `services`, `invoices`, `payments`, `tickets` (read only)

## 7. API / Routes

```txt
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PATCH  /api/customers/:id
POST   /api/customers/:id/deactivate
POST   /api/customers/:id/reactivate
GET    /api/customers/:id/360
POST   /api/customers/drafts
PATCH  /api/customers/drafts/:id
POST   /api/customers/imports
POST   /api/customers/imports/:id/commit
GET    /api/customers/export
GET    /api/customer-segments
POST   /api/customer-segments
```

## 8. UI Notes

- Wizard shows progress and allows back/next without losing data.
- Duplicate warning appears inline with candidate comparison.
- Customer 360 uses tabs: Overview, Subscriptions, Billing, Tickets, Network.
- Empty/loading/error states are required per tab.
- Mobile-friendly for field technicians.

## 9. Audit & Notifications

Audit events:

- `customer.created`, `customer.updated`, `customer.deactivated`,
  `customer.reactivated`
- `customer.imported`, `customer.exported`
- `customer.duplicate_overridden`
- `customer.segment.created/updated`

Notifications:

- Welcome message.
- Import completed/failed.
- Export ready.
- Status change.

## 10. Acceptance Criteria

```gherkin
Scenario: Duplicate NIK is blocked
  Given a customer with NIK 3174...
  When a CS tries to create another customer with the same NIK
  Then the wizard shows a high-confidence duplicate
  And submission is blocked without an override reason

Scenario: Import dry-run does not write customers
  Given a valid import file
  When the user runs dry-run
  Then a validation report is returned
  And no customer rows are created

Scenario: Branch scope on customer detail
  Given a branch-scoped CS in JKT-01
  When they request a customer from BDG-01
  Then the response is 403
```

## 11. Edge Cases & Failure Handling

- Phone number reuse by family members → allow with duplicate override.
- Corporate customer without personal NIK → require NPWP or identity override.
- Import file with mixed branches → reject rows outside actor scope.
- Concurrent edit → optimistic lock with 409.
- Missing plan during network step → allow draft and resolve later.
- Customer merge is not v1; only block/warn + override.

## 12. Open Questions

- Should customer merge be supported in v1.1?
- Should branch transfer be a dedicated workflow?
- Which identity fields are mandatory for corporate customers?
- Should segments support static snapshots?
