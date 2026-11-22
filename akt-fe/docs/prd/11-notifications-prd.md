# 11 — Notifications & Announcements PRD

## Metadata

| Field | Value |
|---|---|
| Document ID | PRD-11 |
| Version | 1.0 |
| Status | Draft |
| Phase | 2 |
| Dependencies | PRD-03, PRD-07, PRD-08, PRD-09 |
| Related tables | `notification_templates`, `announcements`, `notification_logs`, `whatsapp_devices`, `telegram_groups`, `mail_settings`, `customers`, `customer_segments` |
| Related ERD | `erd-v2-growth.mmd` |

## 1. Summary & Goals

Send event-driven and scheduled notifications through WhatsApp, email, and
Telegram. Notifications must not block business transactions and must be
retryable.

### Goals

- Template per event and channel.
- Event-triggered sends.
- Scheduled reminders relative to due dates.
- Segment-based blast and announcements.
- Retry, failover, and delivery logs.
- Opt-out and quiet hours.
- Device/channel health.

### Non-goals

- Marketing automation/CRM journeys.
- Two-way chat inbox.
- Native push notifications (deferred).

## 2. Actors & Permissions

| Actor | Capabilities |
|---|---|
| `admin` | Template, device, blast management |
| `cs`, `finance` | Send/retry notifications |
| `noc` | Telegram group and alert config |
| `branch_manager` | Blast within branch |

Permissions:

```txt
notification.template.manage
notification.send
notification.blast
notification.retry
notification.device.manage
notification.log.read
```

## 3. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| NOTIF-01 | Templates per event, channel, subject, body, active flag. | M |
| NOTIF-02 | Event triggers enqueue notifications asynchronously. | M |
| NOTIF-03 | Scheduled reminders use due date offsets. | M |
| NOTIF-04 | Blast supports segments and preview. | M |
| NOTIF-05 | Delivery logs store status, provider, error, payload. | M |
| NOTIF-06 | Retry with exponential backoff and failover channel. | M |
| NOTIF-07 | Opt-out and quiet hours are enforced. | S |
| NOTIF-08 | WhatsApp device health and rotation. | M |
| NOTIF-09 | Telegram groups for ticket/monitoring alerts. | S |
| NOTIF-10 | SMTP settings and test email. | M |
| NOTIF-11 | Announcements support media and target filters. | S |
| NOTIF-12 | Every send attempt is logged. | M |

## 4. Workflows

### WF-NOTIF-01 — Template CRUD

- Actors: `admin`
- Permissions: `notification.template.manage`

Steps:

1. Select event code and channel.
2. Enter subject/body with allowed placeholders.
3. Validate placeholders against the event payload schema.
4. Activate/deactivate template.
5. Audit `notification_template.created/updated`.

Rules:

- One active template per event + channel.
- Unknown placeholders are rejected.
- Templates cannot include secrets.

### WF-NOTIF-02 — Event-triggered send

- Actors: system
- Trigger: domain event (invoice issued, payment verified, ticket assigned)

Steps:

1. Receive event payload.
2. Resolve active template for event + channel.
3. Render message with customer/contact data.
4. Check opt-out and quiet hours.
5. Enqueue outbox job.
6. Worker sends through provider adapter.
7. Update `notification_logs` status.
8. Retry on failure.

Rules:

- Sending is asynchronous; the main transaction is not blocked.
- Idempotent by event id + template id.
- Quiet hours defer non-urgent messages.

### WF-NOTIF-03 — Scheduled reminder

- Actors: system
- Trigger: scheduler relative to due date

Steps:

1. Find invoices due in N days (configurable).
2. Resolve reminder template.
3. Deduplicate per invoice + template + send date.
4. Enqueue and send.
5. Log delivery.
6. Do not send if invoice is paid/void.

### WF-NOTIF-04 — Blast and announcement

- Actors: `admin`, `branch_manager`
- Permissions: `notification.blast`

Steps:

1. Select segment or target filter.
2. Preview recipient count and sample.
3. Choose channel and template.
4. Schedule or send now.
5. Enqueue batches.
6. Respect opt-out and quiet hours.
7. Track delivery and failures.
8. Audit `notification.blast_created`.

Rules:

- Blast over a threshold requires approval.
- Segment is snapshotted or dynamic per configuration.
- Unsubscribe link for email where applicable.

### WF-NOTIF-05 — Retry and failover

- Actors: system
- Trigger: provider failure or timeout

Steps:

1. Log failure with reason.
2. Retry with exponential backoff (configurable attempts).
3. On final failure, try fallback channel if configured.
4. Mark permanent failure after limit.
5. Alert operations if failure rate exceeds threshold.

### WF-NOTIF-06 — Opt-out and quiet hours

- Actors: customer, system
- Trigger: customer request or settings

Steps:

1. Record opt-out per channel.
2. Exclude opted-out recipients from non-transactional blasts.
3. Transactional messages (invoice/payment) may still send if policy allows.
4. Enforce quiet hours for non-urgent messages.
5. Audit opt-out changes.

### WF-NOTIF-07 — Notification log and health

- Actors: `admin`, `cs`
- Permissions: `notification.log.read`

Steps:

1. Filter logs by date, channel, status, recipient.
2. Show provider response and retry count.
3. Show device health (connected/disconnected).
4. Manual retry for failed messages.
5. Audit manual retry.

## 5. State Models

### Notification log

`queued` → `sending` → `sent` / `failed` / `deferred`

### WhatsApp device

`connected` → `degraded` → `disconnected`

### Blast

`draft` → `scheduled` → `running` → `completed` / `partial` / `failed`

## 6. Data References

- `notification_templates`, `notification_logs`
- `announcements`
- `whatsapp_devices`, `telegram_groups`, `mail_settings`
- `customers`, `customer_contacts`, `customer_segments`
- `invoices`, `payments`, `tickets` (event sources)

## 7. API / Routes

```txt
GET    /api/notification-templates
POST   /api/notification-templates
PATCH  /api/notification-templates/:id
POST   /api/notifications/send
POST   /api/notifications/blast
GET    /api/notifications/logs
POST   /api/notifications/logs/:id/retry
GET    /api/notifications/devices
POST   /api/notifications/devices
PATCH  /api/notifications/devices/:id
POST   /api/notifications/devices/:id/test
GET    /api/announcements
POST   /api/announcements
POST   /api/mail-settings/test
```

## 8. UI Notes

- Template editor with placeholder helper and preview.
- Blast wizard: segment → preview → schedule → result.
- Log table with status chips and retry action.
- Device health cards.
- Opt-out visible on customer profile.

## 9. Audit & Notifications

Audit events:

- `notification_template.created/updated/deactivated`
- `notification.sent`, `notification.failed`, `notification.retried`
- `notification.blast_created/started/completed`
- `notification.opt_out_changed`
- `notification.device_created/updated/tested`

Notifications: operational alerts for provider/device failure.

## 10. Acceptance Criteria

```gherkin
Scenario: Invoice issued notification
  Given an active invoice template for WhatsApp
  When an invoice is issued
  Then a notification is queued
  And the invoice transaction is not blocked
  And delivery is logged

Scenario: Opt-out respected
  Given a customer opted out of marketing messages
  When a blast targets that customer
  Then the message is skipped
  And the reason is logged

Scenario: Retry on provider failure
  Given a provider timeout
  When the worker retries
  Then the attempt count increases
  And the message is sent when the provider recovers
```

## 11. Edge Cases & Failure Handling

- Duplicate event delivery → idempotent log key.
- Quiet hours crossing midnight → correct timezone handling.
- Provider rate limit → backoff and queue.
- Invalid phone number → mark invalid, do not retry forever.
- Template deactivated mid-blast → use snapshot at blast start.

## 12. Open Questions

- Which WhatsApp provider is used in v1?
- Is email required in v1 or WhatsApp-first?
- What is the blast approval threshold?
- Should opt-out apply to transactional messages?
