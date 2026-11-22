# 09 — Ticketing & Fieldwork PRD

## Metadata

| Field | Value |
|---|---|
| Document ID | PRD-09 |
| Version | 1.0 |
| Status | Draft |
| Phase | 2 |
| Dependencies | PRD-03, PRD-05, PRD-06 |
| Related tables | `tickets`, `ticket_categories`, `ticket_events`, `ticket_assignments`, `ticket_schedules`, `ticket_devices`, `installation_reports`, `inventory_items` |
| Related ERD | `erd-v2-core.mmd` |

## 1. Summary & Goals

Handle customer and internal work tickets from creation to closure, including
triage, assignment, scheduling, field work, device usage, and installation
reports.

### Goals

- Customer tickets linked to customer/subscription.
- General tickets without a customer.
- 20+ categories.
- Controlled status machine with role restrictions.
- Multiple technicians per ticket.
- Append-only event history.
- Installation schedule and report.
- Device usage linked to inventory.
- SLA tracking.

### Non-goals

- Live chat with customers.
- Native mobile app.
- Automatic dispatch optimization.

## 2. Actors & Permissions

| Actor | Capabilities |
|---|---|
| `cs` | Create customer ticket, read, add events |
| `sales` | Create ticket for own customers |
| `technician` | Execute assigned tickets, add events, use devices |
| `noc` | Triage, assign, update network-related tickets |
| `branch_manager`, `admin` | Full ticket management within scope |
| `owner` | Full |

Permissions:

```txt
ticket.read, ticket.create, ticket.assign, ticket.schedule
ticket.transition, ticket.close
ticket.event.append
ticket.device.manage
installation_report.create
```

## 3. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| TCK-01 | Create customer ticket with customer, subscription, category, subject, description, priority. | M |
| TCK-02 | Create general ticket without customer. | M |
| TCK-03 | Ticket categories are configurable and seeded with legacy values. | M |
| TCK-04 | Status machine: open, in_progress, pending, scheduled, installation_success, installation_failed, closed. | M |
| TCK-05 | Assign up to N technicians with roles. | M |
| TCK-06 | Schedule installation with date, time slot, and technician. | M |
| TCK-07 | Append-only events with notes, photos, status, actor, and time. | M |
| TCK-08 | Device usage links to inventory items and creates movements. | M |
| TCK-09 | Installation report stores signer, signature, photos, notes. | M |
| TCK-10 | SLA tracks first response and resolution time. | S |
| TCK-11 | Ticket closure requires resolution notes. | M |
| TCK-12 | All transitions are audited. | M |
| TCK-13 | Kanban board grouped by status. | C |

## 4. Workflows

### WF-TCK-01 — Create customer ticket

- Actors: `cs`, `sales`, `admin`
- Permissions: `ticket.create`
- Trigger: customer reports an issue

Steps:

1. Select customer and optional subscription/service.
2. Select category, priority, subject, description.
3. Attach photos (optional).
4. Validate customer branch scope.
5. Create ticket with status `open`.
6. Generate ticket number.
7. Create initial event `created`.
8. Queue notification to NOC/technician group.
9. Audit `ticket.created`.

Rules:

- Customer must be active or have an active/past subscription.
- Category is required.
- Duplicate open ticket warning for same customer/category within 24 hours.

### WF-TCK-02 — Create general ticket

- Actors: `noc`, `admin`, `technician`
- Permissions: `ticket.create`

Steps:

1. Select type `general`.
2. Fill category, subject, description, branch.
3. Optionally link affected devices.
4. Create ticket `open`.
5. Assign to team or self.
6. Audit `ticket.created`.

### WF-TCK-03 — Triage and assign

- Actors: `noc`, `admin`, `branch_manager`
- Permissions: `ticket.assign`

Steps:

1. Review new ticket queue.
2. Validate category/priority; adjust if needed.
3. Assign one lead technician and optional additional technicians.
4. Create `ticket_assignments` rows.
5. Set status `in_progress` when work starts.
6. Append event `assigned`.
7. Notify assignees.
8. Audit `ticket.assigned`.

Rules:

- Assignee must be active and in the same branch (or have global scope).
- Reassignment closes the previous assignment row.
- At least one lead is required before `in_progress`.

### WF-TCK-04 — Schedule installation

- Actors: `cs`, `noc`, `admin`
- Permissions: `ticket.schedule`

Steps:

1. Select installation category ticket.
2. Choose date, time slot, and technician.
3. Check technician availability and conflicts.
4. Create `ticket_schedules` row.
5. Set status `scheduled`.
6. Append event `scheduled`.
7. Notify customer and technician.
8. Audit `ticket.scheduled`.

Rules:

- No double-booking for the same technician/time slot.
- Rescheduling keeps history.
- Customer cancellation sets `pending` with reason.

### WF-TCK-05 — Status transition

- Actors: assigned technician, NOC, admin
- Permissions: `ticket.transition`

Allowed transitions:

```txt
open → in_progress | pending | scheduled
in_progress → pending | installation_success | installation_failed
scheduled → installation_success | installation_failed | pending
pending → in_progress | scheduled
installation_success → closed
installation_failed → in_progress | scheduled
```

Steps:

1. Validate current status and transition permission.
2. For `installation_success`, require installation report or notes.
3. For `installation_failed`, require failure reason.
4. For `closed`, require resolution notes.
5. Update ticket status and timestamps.
6. Append event with status and notes.
7. Audit `ticket.status_changed`.
8. Notify customer/team as configured.

### WF-TCK-06 — Append event

- Actors: assigned technician, NOC, admin, CS
- Permissions: `ticket.event.append`

Steps:

1. Add note, photo, and optional status change.
2. Validate actor can access ticket.
3. Create `ticket_events` row (append-only).
4. If status changed, run WF-TCK-05.
5. Audit `ticket.event_added`.

Rules:

- Events cannot be edited or deleted; corrections create a new event.
- Photos use the file module.

### WF-TCK-07 — Record device usage

- Actors: technician, warehouse, admin
- Permissions: `ticket.device.manage`

Steps:

1. Select inventory item in stock.
2. Select action `used`, `returned`, or `replaced`.
3. Validate item and branch.
4. Create `ticket_devices` row.
5. Create inventory movement (PRD-06).
6. Append event.
7. Audit `ticket.device_recorded`.

### WF-TCK-08 — Installation report

- Actors: technician, admin
- Permissions: `installation_report.create`

Steps:

1. Open completed installation ticket.
2. Fill report number, signer name, signature, photos, notes.
3. Validate required evidence.
4. Save report; attach files.
5. Set status `installation_success` if not already.
6. Append event.
7. Audit `installation_report.created`.
8. Generate PDF (optional).

### WF-TCK-09 — Close ticket and SLA

- Actors: `cs`, `noc`, `admin`, `branch_manager`
- Permissions: `ticket.close`

Steps:

1. Require resolution notes and category.
2. Confirm customer confirmation (optional).
3. Set status `closed`, `closed_at`.
4. Calculate first response and resolution duration.
5. Flag SLA breach if exceeded.
6. Append event and audit `ticket.closed`.
7. Notify customer with satisfaction survey (optional).

## 5. State Model

```txt
open
 ├─→ in_progress
 │    ├─→ pending
 │    ├─→ installation_success → closed
 │    └─→ installation_failed
 ├─→ scheduled
 │    ├─→ installation_success → closed
 │    ├─→ installation_failed
 │    └─→ pending
 └─→ pending
```

## 6. Data References

- `tickets`, `ticket_categories`, `ticket_events`
- `ticket_assignments`, `ticket_schedules`, `ticket_devices`
- `installation_reports`
- `customers`, `subscriptions`, `services`
- `inventory_items`, `inventory_movements`
- `files`, `attachments`
- `employees` (assignees)

## 7. API / Routes

```txt
GET    /api/tickets
POST   /api/tickets
GET    /api/tickets/:id
PATCH  /api/tickets/:id
POST   /api/tickets/:id/assign
POST   /api/tickets/:id/schedule
POST   /api/tickets/:id/transition
POST   /api/tickets/:id/events
POST   /api/tickets/:id/devices
POST   /api/tickets/:id/installation-report
POST   /api/tickets/:id/close
GET    /api/ticket-categories
POST   /api/ticket-categories
GET    /api/tickets/board
```

## 8. UI Notes

- Ticket list with status, priority, category, assignee, SLA.
- Detail with timeline, customer context, devices, and schedule.
- Status action buttons enabled by current state and permission.
- Mobile-first event composer with camera upload.
- Kanban board optional.

## 9. Audit & Notifications

Audit events:

- `ticket.created`, `ticket.assigned`, `ticket.scheduled`
- `ticket.status_changed`, `ticket.event_added`
- `ticket.device_recorded`
- `installation_report.created`
- `ticket.closed`, `ticket.sla_breached`

Notifications:

- Ticket created to NOC/team.
- Assignment to technician.
- Schedule to customer and technician.
- Status update to customer.
- SLA breach to manager.

## 10. Acceptance Criteria

```gherkin
Scenario: Invalid transition is blocked
  Given a closed ticket
  When a technician tries to move it to in_progress
  Then the request is rejected
  And the status is unchanged

Scenario: Installation success requires evidence
  Given a scheduled installation
  When a technician marks installation_success without report or notes
  Then the request is rejected

Scenario: Device usage reduces stock
  Given an in-stock inventory item
  When a technician records it as used on a ticket
  Then the item becomes installed
  And an inventory movement is created
```

## 11. Edge Cases & Failure Handling

- Reassignment while work in progress → close previous assignment and notify.
- Duplicate ticket → warn but allow with reason.
- Customer cancels schedule → move to pending, keep history.
- Missing inventory item → block device usage.
- SLA timezone boundary → use Asia/Jakarta.

## 12. Open Questions

- Is customer confirmation required for closure?
- Are parts/devices billable automatically?
- Should SLA targets be per category or global?
- Is Kanban required for v1 or v1.1?
