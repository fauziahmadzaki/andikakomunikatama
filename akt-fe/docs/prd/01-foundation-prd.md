# 01 — Foundation PRD

## Metadata

| Field | Value |
|---|---|
| Document ID | PRD-01 |
| Version | 1.0 |
| Status | Draft |
| Phase | 0 |
| Dependencies | none |
| Related tables | `company_profiles`, `branches`, `system_settings`, `files`, `attachments`, `audit_logs` |
| Related ERD | `erd-v2-core.mmd` |

## 1. Summary & Goals

Provide the platform foundation: company profile, branch management, system
settings, number sequences, file storage, and audit log. Every other module
depends on these capabilities.

### Goals

- Single company profile that drives invoices, branding, and regulatory fees.
- Branch (legacy `lokasi`) as the primary data scope.
- Configurable operational settings without code changes.
- Transactional, non-reusable document numbers.
- Central file storage with signed access.
- Immutable audit trail foundation.

### Non-goals

- User authentication and roles (PRD-02).
- Financial posting (PRD-10).
- Notification delivery (PRD-11).

## 2. Actors & Permissions

| Actor | Capabilities |
|---|---|
| `owner` | Full company profile, branches, settings, audit |
| `admin` | Branches, settings, audit; company profile read/update |
| `branch_manager` | Read company/branches, read audit for own branch |
| `finance` | Read company profile, read settings relevant to billing |
| `hrd` | Read company profile |
| others | Read branch list needed for scoping |

Permissions:

```txt
company.read, company.update
branch.read, branch.create, branch.update, branch.deactivate
setting.read, setting.update
sequence.issue
file.upload, file.read
audit.read
```

## 3. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FND-01 | Company profile is a singleton with name, legal name, logo, address, contact, tax number, invoice prefix, BHP/USO/ISP fee rates. | M |
| FND-02 | Branches support create, update, deactivate, and head-office flag. | M |
| FND-03 | Branch code is unique and immutable after creation. | M |
| FND-04 | System settings use a typed key-value store with validation. | M |
| FND-05 | Number sequences are transactional, unique, and reset per configured period. | M |
| FND-06 | Files are stored in object storage with metadata and checksum. | M |
| FND-07 | Attachments link files to any entity through `attachments`. | M |
| FND-08 | Signed URLs expire and are generated only after authorization. | M |
| FND-09 | Audit logs record actor, action, entity, before/after, IP, user agent, time. | M |
| FND-10 | Audit logs are append-only and searchable by entity, actor, action, and date. | M |
| FND-11 | Feature flags can enable/disable modules without deployment. | S |
| FND-12 | Settings and company changes are audited. | M |

## 4. Workflows

### WF-FND-01 — Company profile setup

- Actors: `owner`, `admin`
- Permissions: `company.update`
- Trigger: first-time setup or profile update
- Preconditions: user authenticated

Steps:

1. Open company profile form.
2. Show current values (empty on first setup).
3. Fill company name, legal name, address, phone, email, tax number,
   invoice prefix, logo, BHP/USO/ISP fee rates.
4. Validate required fields and rate ranges (`0..100`).
5. Upload logo through WF-FND-05.
6. Save profile inside a transaction.
7. Write audit `company.updated` with before/after.
8. Invalidate cached company settings.

Validation:

- `name` required, max 200.
- `invoice_prefix` uppercase alphanumeric, max 10, unique.
- Fee rates numeric with two decimals.
- Only one `company_profiles` row is allowed.

Failure cases:

- Concurrent update → last-write-wins with `updated_at` check; return 409.
- Invalid logo type/size → reject file before saving profile.

Acceptance:

```gherkin
Given an authenticated owner
When they save a valid company profile
Then the profile is stored
And an audit entry company.updated is written
And the invoice prefix is available to billing
```

### WF-FND-02 — Branch create/update/deactivate

- Actors: `owner`, `admin`
- Permissions: `branch.create`, `branch.update`, `branch.deactivate`
- Trigger: branch management screen

Steps:

1. Create: fill code, name, address, phone, head-office flag.
2. Validate unique code and required fields.
3. Save branch; write audit `branch.created`.
4. Update: load branch, edit mutable fields. Code is read-only.
5. Save; write audit `branch.updated`.
6. Deactivate: block if active users, customers, or subscriptions are still
   assigned, unless a transfer is confirmed.
7. Set `is_active = false`; write audit `branch.deactivated`.

Rules:

- Exactly one head office is allowed.
- Deactivation is soft (no hard delete).
- Deactivated branches cannot receive new customers or subscriptions.

Acceptance:

```gherkin
Given an active branch with no customers
When an admin deactivates it
Then is_active becomes false
And the branch no longer appears in new-customer branch options
```

### WF-FND-03 — System settings update

- Actors: `owner`, `admin`
- Permissions: `setting.update`
- Trigger: settings screen

Steps:

1. List settings grouped by module.
2. Render typed controls (string, number, boolean, JSON).
3. Validate against the setting schema.
4. Save changed keys only inside a transaction.
5. Write audit `setting.updated` with key-level diff.
6. Clear relevant caches.

Protected settings:

- Number sequence prefixes.
- Tax defaults.
- Suspension grace period.
- Notification quiet hours.
- File size limits.

Failure cases:

- Unknown key → 400.
- Invalid type → 422 with field errors.
- Concurrent update → 409.

### WF-FND-04 — Number sequence issue

- Actors: system, internal services
- Permissions: `sequence.issue`
- Trigger: customer/invoice/payment/ticket/journal creation

Steps:

1. Read sequence key (e.g., `invoice_2026`).
2. Lock the sequence row with `SELECT ... FOR UPDATE`.
3. Increment the counter.
4. Format the number using prefix, year, and zero-padded counter.
5. Commit before using the number.
6. Return the formatted number.

Rules:

- Numbers are never reused, even after transaction rollback.
- Sequence reset is a scheduled configuration change, not automatic deletion.
- A unique constraint on the target table is the final safeguard.

Failure cases:

- Missing sequence row → create with counter 0 inside the same transaction.
- Duplicate number → retry once, then fail with 500 and alert.

### WF-FND-05 — File upload and signed URL

- Actors: authenticated users with `file.upload` / `file.read`
- Trigger: logo, KTP, payment proof, ticket photo, attachment

Steps:

1. Client requests an upload intent (filename, mime, size).
2. Server validates mime and size against settings.
3. Server returns a presigned upload URL and a pending `files` row.
4. Client uploads directly to object storage.
5. Client confirms upload.
6. Server verifies object metadata/checksum, marks `files` ready.
7. Consumer entity stores `file_id` or creates `attachments`.
8. Read access returns a short-lived signed URL after authorization.

Rules:

- Allowed mime list per context (images/PDF).
- Max size from settings (default 5 MB).
- Filenames are sanitized; storage keys are generated.
- PII files require elevated permission.

Failure cases:

- Upload not confirmed within 24 hours → mark orphaned and clean up.
- Checksum mismatch → reject and delete object.

### WF-FND-06 — Audit log query

- Actors: `owner`, `admin`, `branch_manager` (own branch)
- Permissions: `audit.read`
- Trigger: audit screen

Steps:

1. User selects date range and optional actor/entity/action filters.
2. Server enforces branch scope.
3. Query paginated audit logs.
4. Render read-only timeline.
5. Export requires `audit.export` and writes a meta-audit entry.

Rules:

- Audit rows cannot be edited or deleted.
- Sensitive values are masked in before/after payloads.
- Default range: last 7 days, max 90 days per query.

## 5. State Models

### Branch

`active` → `inactive`

### File

`pending` → `ready` → `attached` / `orphaned`

## 6. Data References

- `company_profiles`
- `branches`
- `system_settings`
- `files`
- `attachments`
- `audit_logs`

## 7. API / Routes

```txt
GET    /api/company
PUT    /api/company
GET    /api/branches
POST   /api/branches
PATCH  /api/branches/:id
POST   /api/branches/:id/deactivate
GET    /api/settings
PUT    /api/settings
POST   /api/files/upload-intent
POST   /api/files/:id/confirm
GET    /api/files/:id/signed-url
GET    /api/audit-logs
```

All routes require authentication and authorization.

## 8. UI Notes

- Settings form grouped by module with inline help.
- Branch list shows status, head-office badge, customer count.
- Audit timeline supports filters and pagination.
- Destructive actions require confirmation and reason.

## 9. Notifications & Audit

Audit events:

- `company.created`, `company.updated`
- `branch.created`, `branch.updated`, `branch.deactivated`
- `setting.updated`
- `file.uploaded`, `file.accessed` (sensitive files)
- `audit.exported`

Notifications: none except optional branch deactivation warning.

## 10. Acceptance Criteria

```gherkin
Scenario: Company setup
  Given no company profile exists
  When an owner submits valid company data
  Then the profile is created
  And the invoice prefix is reserved

Scenario: Branch code uniqueness
  Given branch code "JKT-01" exists
  When an admin creates another branch with "JKT-01"
  Then the request fails with 409

Scenario: Deactivate branch with active customers
  Given a branch has active customers
  When an admin deactivates it
  Then the request is blocked with a transfer requirement
```

## 11. Edge Cases & Failure Handling

- Two head offices submitted concurrently → unique partial index prevents it.
- Settings update with stale version → 409.
- Signed URL requested for unauthorized file → 403.
- Sequence exhausted → alert; do not wrap around silently.
- Audit payload too large → truncate with a marker and keep key fields.

## 12. Open Questions

- Should branches support a hierarchy (region → branch)?
- Should file retention differ per attachment type?
- Should feature flags be global or per branch?
