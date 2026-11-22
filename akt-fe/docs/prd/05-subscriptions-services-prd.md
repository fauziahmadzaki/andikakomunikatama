# 05 — Subscriptions & Service Lifecycle PRD

## Metadata

| Field | Value |
|---|---|
| Document ID | PRD-05 |
| Version | 1.0 |
| Status | Draft |
| Phase | 1 |
| Dependencies | PRD-03, PRD-04, PRD-06 |
| Related tables | `subscriptions`, `subscription_status_history`, `services`, `service_credentials`, `customers`, `plans`, `routers`, `olts`, `passive_devices` |
| Related ERD | `erd-v2-core.mmd` |

## 1. Summary & Goals

Manage the customer subscription and its network services, including
provisioning, activation, suspension (isolir), reactivation, upgrade/downgrade,
and termination.

### Goals

- One subscription can own multiple services.
- Provisioning is explicit and auditable.
- Status transitions are controlled and reversible where safe.
- Automatic suspension is idempotent and reviewable.
- Payment-triggered reactivation.
- Bulk migration and due-date changes.

### Non-goals

- Invoice generation (PRD-07).
- Payment recording (PRD-08).
- Device topology management (PRD-06).
- Advanced bandwidth policy management (v1.1).

## 2. Actors & Permissions

| Actor | Capabilities |
|---|---|
| `owner`, `admin` | Full subscription/service lifecycle |
| `branch_manager` | Lifecycle within branch |
| `cs` | Create/activate/suspend within branch |
| `technician`, `noc` | Provision, suspend/reactivate service, read |
| `finance` | Read, reactivate after payment |

Permissions:

```txt
subscription.read, subscription.create, subscription.update
subscription.activate, subscription.suspend, subscription.terminate
subscription.migrate
service.read, service.provision, service.suspend, service.terminate
```

## 3. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| SUB-01 | Create subscription with customer, plan, branch, due day, prorate, tax, sales owner. | M |
| SUB-02 | A subscription may have multiple services (internet, IPTV, static IP). | M |
| SUB-03 | Service provisioning supports PPPoE, hotspot, and static. | M |
| SUB-04 | Provisioning result is recorded per service. | M |
| SUB-05 | Activation requires at least one active service or explicit manual override. | M |
| SUB-06 | Manual suspension and reactivation are audited. | M |
| SUB-07 | Automatic suspension runs for overdue invoices after grace period. | M |
| SUB-08 | Payment verification triggers reactivation for automatically suspended services. | M |
| SUB-09 | Upgrade/downgrade keeps history and applies the new price from the next billing period. | M |
| SUB-10 | Termination closes services and preserves history. | M |
| SUB-11 | Due day changes are audited and affect future invoices only. | M |
| SUB-12 | Bulk migration previews affected subscriptions. | S |
| SUB-13 | All status changes write `subscription_status_history`. | M |

## 4. Workflows

### WF-SUB-01 — Create subscription

- Actors: `cs`, `admin`, `branch_manager`
- Permissions: `subscription.create`
- Trigger: customer wizard network step or subscription screen

Steps:

1. Select customer, plan, branch, sales owner.
2. Set start date, due day (1–31), prorate, tax.
3. Apply discount if eligible.
4. Preview price, prorate, discount, tax, total.
5. Save subscription as `draft`.
6. Create one or more draft services (optional).
7. Audit `subscription.created`.
8. Continue to provisioning or activation.

Validation:

- Plan available at branch.
- Customer and branch active.
- Due day valid.
- No duplicate active subscription for the same plan unless multi-subscription
  is explicitly allowed (open question).

### WF-SUB-02 — Add and provision service

- Actors: `technician`, `noc`, `admin`
- Permissions: `service.provision`
- Trigger: subscription detail → add service

Steps:

1. Choose service type and network assignment:
   - router + PPPoE/hotspot profile
   - OLT + passive device (ODP)
   - static IP configuration
2. Enter username and generate/secure credential.
3. Save service as `pending`.
4. Call the integration adapter (PRD-13):
   - create PPPoE secret or hotspot user
   - bind ONU/CPE if required
5. On success, mark `provisioned` and store adapter response metadata.
6. On failure, keep `pending`, store error, and allow retry.
7. Write audit `service.provisioned` / `service.provision_failed`.

Rules:

- Credentials are hashed or stored as `secret_ref`.
- Provisioning is idempotent by `service_id`.
- Retry uses the same command key to avoid duplicate secrets.

Failure cases:

- Router unreachable → retry queue + alert.
- Duplicate PPPoE username → block before calling adapter.
- ODP capacity full → block with capacity error.

### WF-SUB-03 — Activate subscription

- Actors: `cs`, `admin`, `technician`
- Permissions: `subscription.activate`

Steps:

1. Check subscription is `draft` and has at least one service.
2. Confirm services are `provisioned` or mark manual override with reason.
3. Set subscription `active`, services `active`.
4. Set `start_date` if not set.
5. Write status history and audit `subscription.activated`.
6. Send activation notification.
7. If this is the first month, ensure prorate invoice can be generated.

### WF-SUB-04 — Upgrade/downgrade

- Actors: `admin`, `branch_manager`, `cs`
- Permissions: `subscription.update`

Steps:

1. Select new plan.
2. Show price difference and effective date.
3. Choose effective mode: next billing period or immediate with prorate.
4. Update `plan_id`, `price_snapshot`, and optionally service profile.
5. If immediate, schedule a prorated adjustment invoice.
6. Write status history and audit `subscription.plan_changed`.
7. Notify customer.

Rules:

- Historical invoices never change.
- Downgrade cannot go below active service requirements.
- Network profile change may require re-provisioning.

### WF-SUB-05 — Manual suspend/reactivate

- Actors: `cs`, `admin`, `noc`, `technician`
- Permissions: `subscription.suspend`

Steps:

1. Request suspension with reason.
2. Set subscription `suspended`; set services `suspended`.
3. Call adapter to disable PPPoE/hotspot/static access.
4. Write status history and audit `subscription.suspended`.
5. Reactivation checks finance eligibility (no blocking overdue) unless
   override permission is used.
6. Call adapter to re-enable service.
7. Set status `active`; audit `subscription.reactivated`.
8. Notify customer.

### WF-SUB-06 — Automatic suspension scheduler

- Actors: system
- Trigger: scheduled job after due date + grace period
- Permissions: system

Steps:

1. Select invoices overdue beyond grace period.
2. Map invoices to subscriptions with automatic suspension mode.
3. Exclude subscriptions with an approved hold or active promise-to-pay.
4. Create a suspension batch with preview counts.
5. For each item, re-check status and outstanding balance inside a transaction.
6. Set subscription/service `suspended`; call adapter.
7. Record batch result per item (success/failure).
8. Audit `subscription.auto_suspended` per item and batch summary.
9. Notify customers.
10. Job is idempotent per billing date and subscription.

Rules:

- Never suspend twice.
- Failures are retried next run.
- A maximum batch size and approval threshold are configurable.
- Dry-run mode is mandatory.

### WF-SUB-07 — Reactivate after payment

- Actors: system
- Trigger: payment verified allocated to overdue invoices

Steps:

1. Recalculate subscription outstanding balance.
2. If no blocking overdue remains, find suspended services.
3. Call adapter to re-enable.
4. Set subscription/services `active`.
5. Write status history and audit `subscription.payment_reactivated`.
6. Notify customer.

Failure cases:

- Adapter failure → mark `reactivation_pending` and retry.
- Partial payment still leaves overdue → do not reactivate.

### WF-SUB-08 — Terminate subscription

- Actors: `admin`, `branch_manager`
- Permissions: `subscription.terminate`

Steps:

1. Require reason and confirmation.
2. Check outstanding balance; allow termination with debt flag if approved.
3. Disable services through the adapter.
4. Set subscription/services `terminated`, set `end_date`.
5. Write status history and audit `subscription.terminated`.
6. Keep invoices, payments, and history.
7. Notify customer.

### WF-SUB-09 — Bulk migration and due date change

- Actors: `admin`
- Permissions: `subscription.migrate`
- Trigger: operational migration

Steps:

1. Select filters (branch, plan, due day, status).
2. Choose action: change plan, change due day, change branch, change sales.
3. Preview affected subscriptions and conflicts.
4. Run in batches with checkpointing.
5. Write status history/migration log per item.
6. Audit batch summary.
7. Notify completion and failures.

Rules:

- Idempotent per `migration_id`.
- No historical invoice changes.
- Conflicts are reported, not silently skipped.

## 5. State Models

### Subscription

`draft` → `active` → `suspended` → `terminated`

### Service

`pending` → `provisioned` → `active` → `suspended` → `terminated`

### Suspension batch

`previewed` → `running` → `completed` / `partial` / `failed`

## 6. Data References

- `subscriptions`, `subscription_status_history`
- `services`, `service_credentials`
- `customers`, `plans`, `plan_prices`, `discounts`
- `routers`, `olts`, `passive_devices`
- `invoices`, `payments` (read for suspension/reactivation)

## 7. API / Routes

```txt
GET    /api/subscriptions
POST   /api/subscriptions
GET    /api/subscriptions/:id
PATCH  /api/subscriptions/:id
POST   /api/subscriptions/:id/activate
POST   /api/subscriptions/:id/suspend
POST   /api/subscriptions/:id/reactivate
POST   /api/subscriptions/:id/terminate
POST   /api/subscriptions/:id/plan-change
POST   /api/subscriptions/:id/services
POST   /api/services/:id/provision
POST   /api/services/:id/retry
POST   /api/subscriptions/bulk-migration
GET    /api/suspension-batches
POST   /api/suspension-batches/preview
POST   /api/suspension-batches/:id/run
```

## 8. UI Notes

- Subscription detail shows status timeline, services, invoices, and tickets.
- Provisioning shows step-by-step adapter progress and retry.
- Suspension batch shows preview, excluded rows, and per-row result.
- Plan change shows price impact before confirmation.
- Destructive actions require reason and typed confirmation.

## 9. Audit & Notifications

Audit events:

- `subscription.created`, `subscription.activated`, `subscription.plan_changed`
- `subscription.suspended`, `subscription.reactivated`, `subscription.terminated`
- `subscription.auto_suspended`, `subscription.payment_reactivated`
- `service.provisioned`, `service.provision_failed`
- `subscription.bulk_migrated`

Notifications:

- Activation, suspension, reactivation, termination.
- Provisioning failure to NOC.
- Bulk migration summary.

## 10. Acceptance Criteria

```gherkin
Scenario: Automatic suspension is idempotent
  Given an overdue invoice beyond the grace period
  When the suspension job runs twice
  Then the subscription is suspended once
  And the second run skips it

Scenario: Payment reactivation
  Given a subscription suspended for non-payment
  When the payment is verified and no overdue remains
  Then services are re-enabled
  And the subscription becomes active

Scenario: Provisioning failure keeps pending
  Given a router that is unreachable
  When a technician provisions a PPPoE service
  Then the service remains pending
  And the failure is logged and retryable
```

## 11. Edge Cases & Failure Handling

- Adapter offline → queue/retry, never mark provisioned optimistically.
- Payment during suspension batch → re-check before applying suspension.
- Duplicate provision command → idempotent adapter key.
- Multi-service subscription where one service fails → subscription remains
  active if others are active; failed service stays pending.
- Grace period edge at month end → clamp due date.

## 12. Open Questions

- Are multiple active subscriptions per customer allowed in v1?
- Is immediate plan change with prorate required in v1?
- Should suspension require per-batch approval above a threshold?
- Which adapter operations are synchronous vs queued?
