# 14 — Security, Audit & Compliance PRD

## Metadata

| Field | Value |
|---|---|
| Document ID | PRD-14 |
| Version | 1.0 |
| Status | Draft |
| Phase | 0 |
| Dependencies | PRD-02 |
| Related tables | `audit_logs`, `users`, `files`, `customer_identities`, financial tables |
| Related ERD | `erd-v2-core.mmd` |

## 1. Summary & Goals

Define the security and compliance baseline for the platform. Security is a
cross-cutting requirement, not a post-launch hardening task.

### Goals

- Server-side authorization and deny-by-default.
- Immutable audit trail.
- Protection of PII and credentials.
- Rate limiting and lockout.
- Access review.
- Data retention and secure deletion.
- Backup, restore, and incident readiness.

### Non-goals

- SOC 2 certification.
- Penetration test execution (external vendor).
- Multi-tenant isolation.

## 2. Actors & Permissions

| Actor | Capabilities |
|---|---|
| `owner` | Full security configuration, access review, audit |
| `admin` | Audit review, user access management |
| `finance`, `hrd` | Access to sensitive data within role |
| all users | Manage own credentials and 2FA |
| security operator | Incident response and log review |

Permissions:

```txt
audit.read, audit.export
security.config.manage
access.review
pii.read, pii.export
retention.manage
backup.manage
```

## 3. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| SEC-01 | Deny-by-default authorization for every route and action. | M |
| SEC-02 | Object-level authorization prevents IDOR. | M |
| SEC-03 | Every mutation and sensitive read writes an audit log. | M |
| SEC-04 | Audit logs are append-only and tamper-evident. | M |
| SEC-05 | Passwords use Argon2id with policy enforcement. | M |
| SEC-06 | Device and provider secrets use Vault/KMS. | M |
| SEC-07 | PII (NIK, KTP, photos) is access-controlled and audited. | M |
| SEC-08 | Files are served through short-lived signed URLs. | M |
| SEC-09 | Login and sensitive endpoints are rate-limited. | M |
| SEC-10 | Access review runs at least quarterly. | S |
| SEC-11 | Retention jobs purge or anonymize expired data. | S |
| SEC-12 | Daily backups with point-in-time recovery and restore drills. | M |
| SEC-13 | Security events raise alerts to operations. | M |
| SEC-14 | CSRF/CSP/secure headers are enforced. | M |

## 4. Workflows

### WF-SEC-01 — Audit review

- Actors: `owner`, `admin`
- Permissions: `audit.read`

Steps:

1. Select date range, actor, entity, action.
2. Enforce branch scope.
3. Query paginated audit records.
4. Show before/after diff with sensitive fields masked.
5. Export with `audit.export` permission.
6. Audit the export itself.

Rules:

- Audit rows cannot be edited or deleted.
- Default retention: 2 years (configurable).
- Large exports are asynchronous.

### WF-SEC-02 — PII access

- Actors: authorized roles only
- Permissions: `pii.read`

Steps:

1. Request PII (NIK, KTP photo, address).
2. Verify role and object scope.
3. Serve via signed URL for files.
4. Audit `pii.accessed` with actor, object, reason.
5. Mask by default in lists and exports.

Rules:

- PII is never included in logs.
- Bulk PII export requires `pii.export` and approval.
- Access to terminated employee records is restricted.

### WF-SEC-03 — Rate limit and lockout

- Actors: system
- Trigger: login, password reset, sensitive API

Steps:

1. Apply per-IP and per-account rate limits.
2. Track failed login attempts.
3. Lock temporarily after threshold.
4. Return 429 with retry-after.
5. Audit lockout and unlock.
6. Alert on distributed attack patterns.

### WF-SEC-04 — Access review

- Actors: `owner`, `admin`
- Permissions: `access.review`

Steps:

1. Generate a review of users, roles, branches, last login, privileged flags.
2. Reviewer marks keep/revoke/change.
3. Apply changes with audit.
4. Store review record and export.
5. Schedule next review.

### WF-SEC-05 — Retention job

- Actors: system
- Permissions: `retention.manage`
- Trigger: scheduled job

Steps:

1. Apply retention rules per data class.
2. Identify expired records (audit, logs, files, sessions).
3. Anonymize or hard-delete where legally allowed.
4. Keep financial records for the configured legal period.
5. Write a retention report.
6. Audit `retention.executed`.

Rules:

- Never delete posted financial entries.
- Soft-delete business records; hard-delete only personal data after the
  retention window.

### WF-SEC-06 — Backup and restore drill

- Actors: operations
- Permissions: `backup.manage`

Steps:

1. Run daily automated backup.
2. Verify checksum and encryption.
3. Perform periodic restore to a staging environment.
4. Record RPO/RTO results.
5. Audit `backup.verified` / `restore.drilled`.
6. Update runbook with findings.

## 5. Security Controls

- TLS everywhere; HSTS.
- Secure cookies: `HttpOnly`, `Secure`, `SameSite=Lax`.
- CSRF protection for state-changing requests.
- CSP with allowlisted origins.
- Input validation on the server.
- Output encoding.
- SQL injection protection via parameterized queries/ORM.
- SSRF protection for adapter endpoints.
- File upload validation and antivirus scan (optional).
- Dependency scanning and lockfile review.
- Secrets scanning in CI.

## 6. Data Classification

| Class | Examples | Handling |
|---|---|---|
| Public | plan catalog | no restriction |
| Internal | operational reports | authenticated staff |
| Confidential | invoices, payments, payroll | role + branch scope |
| Restricted | NIK, KTP photos, credentials | explicit permission + audit |

## 7. Data References

- `audit_logs`
- `users`, `roles`, `permissions`
- `customer_identities`, `files`, `attachments`
- `journal_entries`, `payments`, `payslips`
- `system_settings`

## 8. API / Routes

```txt
GET    /api/audit-logs
POST   /api/audit-logs/export
GET    /api/security/access-review
POST   /api/security/access-review/:id/apply
GET    /api/security/retention
POST   /api/security/retention/run
POST   /api/security/backup/verify
```

## 9. UI Notes

- Audit timeline with filters and masked diffs.
- PII reveal requires a reason and shows a warning.
- Access review table with bulk actions.
- Security dashboard: failed logins, lockouts, open circuits, retention status.
- Clear 403 page; no sensitive data in error messages.

## 10. Audit & Alerts

Audit events:

- `auth.login_failed`, `auth.lockout`
- `access.denied`
- `pii.accessed`, `pii.exported`
- `audit.exported`
- `retention.executed`
- `backup.verified`, `restore.drilled`
- `security.config_changed`

Alerts:

- Multiple failed logins.
- Privileged role change.
- PII bulk export.
- Retention job failure.
- Backup failure.

## 11. Acceptance Criteria

```gherkin
Scenario: Unauthorized branch access
  Given a branch-scoped user
  When they request another branch's customer
  Then the response is 403
  And access.denied is audited

Scenario: Audit immutability
  Given an audit log entry
  When any user tries to update or delete it
  Then the operation is rejected

Scenario: PII access audit
  Given a user with pii.read
  When they open a KTP photo
  Then a signed URL is returned
  And pii.accessed is audited
```

## 12. Edge Cases & Failure Handling

- Audit write failure → block the mutation or queue reliably.
- Vault unavailable → fail closed for secret-dependent operations.
- Backup restore missing → alert and escalate.
- Retention conflict with legal hold → skip and report.
- Session fixation → rotate session on login.

## 13. Open Questions

- What retention periods are legally required for each data class?
- Is antivirus scanning required for uploads in v1?
- Is a SIEM integration required?
- Which roles may export PII in bulk?
