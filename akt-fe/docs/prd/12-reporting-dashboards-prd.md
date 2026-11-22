# 12 — Reporting & Dashboards PRD

## Metadata

| Field | Value |
|---|---|
| Document ID | PRD-12 |
| Version | 1.0 |
| Status | Draft |
| Phase | 3 |
| Dependencies | PRD-03 to PRD-10 |
| Related tables | read models, `invoices`, `payments`, `subscriptions`, `tickets`, `inventory_items`, `journal_lines`, `customers` |
| Related ERD | `erd-v2-all.mmd` |

## 1. Summary & Goals

Provide role-based dashboards and operational reports with filters, drilldown,
exports, and scheduled delivery.

### Goals

- Dashboard per role: owner, branch manager, sales, NOC, finance, HRD.
- Operational reports: customers, subscriptions, invoices, payments, tickets,
  inventory, payroll (deferred).
- Filters by branch, period, plan, status, due date.
- Drilldown from KPI to detail.
- Export Excel/CSV/PDF.
- Scheduled reports via email/WhatsApp.
- Saved filters and KPI definitions.

### Non-goals

- BI self-service query builder.
- Data warehouse/OLAP.
- Real-time streaming dashboards.

## 2. Actors & Permissions

| Actor | Capabilities |
|---|---|
| `owner` | All dashboards and reports |
| `branch_manager` | Branch dashboards and reports |
| `finance` | Financial reports |
| `sales` | Own acquisition/commission reports |
| `noc` | Network and ticket reports |
| `admin`, `cs` | Operational reports within scope |

Permissions:

```txt
dashboard.view
report.view, report.export, report.schedule
report.saved_filter.manage
```

## 3. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| RPT-01 | Dashboard widgets are role-aware and branch-scoped. | M |
| RPT-02 | Reports support period, branch, plan, status, and due date filters. | M |
| RPT-03 | KPI drilldown opens filtered detail list. | S |
| RPT-04 | Export supports Excel/CSV and PDF for selected reports. | M |
| RPT-05 | Large exports run asynchronously and notify when ready. | M |
| RPT-06 | Scheduled reports can be delivered by email/WhatsApp. | S |
| RPT-07 | Saved filters are reusable per user/team. | S |
| RPT-08 | Financial reports read from the ledger, not cached totals. | M |
| RPT-09 | All export and schedule actions are audited. | M |
| RPT-10 | Dashboard loads within 2 seconds for 10k customers. | M |

## 4. Workflows

### WF-RPT-01 — Role dashboard

- Actors: authenticated users
- Trigger: open dashboard

Steps:

1. Resolve role and branch scope.
2. Load widgets allowed for the role.
3. Query aggregates in parallel with caching where safe.
4. Render KPI cards, charts, and recent activity.
5. Show "no data" states per widget, not whole-page failure.
6. Log slow queries.

Widgets:

- Owner: revenue, margin, active customers, outstanding, tickets.
- Branch manager: customers, invoices, payments, deposits, tickets.
- Sales: acquisitions, commission, deposits.
- NOC: device status, open tickets, SLA, outages.
- Finance: cash position, AR aging, expenses.

### WF-RPT-02 — Report query and filter

- Actors: permitted roles
- Trigger: report screen

Steps:

1. Select report template.
2. Set filters (period, branch, plan, status).
3. Enforce branch scope.
4. Run paginated query.
5. Render totals and rows.
6. Allow drilldown to source records.
7. Save filters if requested.

Rules:

- Default period: current month.
- Max date range configurable.
- PII/financial columns masked by permission.

### WF-RPT-03 — Export

- Actors: permitted roles
- Permissions: `report.export`

Steps:

1. Validate filters and row count.
2. Generate file asynchronously above threshold.
3. Store file in `files`.
4. Notify user when ready.
5. Audit `report.exported`.
6. Expire file after 24 hours.

### WF-RPT-04 — Scheduled report

- Actors: `owner`, `finance`, `branch_manager`
- Permissions: `report.schedule`

Steps:

1. Select report, filters, format, recipients, schedule.
2. Validate cron/timezone (Asia/Jakarta).
3. Save schedule.
4. Scheduler runs at the configured time.
5. Generate file and send notification.
6. Log success/failure.
7. Audit `report.schedule_created`.

### WF-RPT-05 — KPI drilldown

- Actors: dashboard viewers
- Trigger: click KPI card

Steps:

1. Open filtered list matching the KPI definition.
2. Show the same period/branch filters.
3. Allow export within permission.
4. Keep filter state in the URL.

## 5. KPI Definitions

| KPI | Definition |
|---|---|
| Active customers | Customers with status active and at least one active subscription |
| New customers | Customers registered in period |
| Revenue | Verified payments allocated in period |
| Outstanding AR | Sum of unpaid invoice balances |
| Collection rate | Verified payments / issued invoices in period |
| Churn | Terminated subscriptions / active at period start |
| Ticket SLA | Closed tickets within SLA / closed tickets |
| Inventory value | Sum of in-stock item current value |
| Cash position | Posted ledger balance of cash/bank accounts |

KPI definitions must be documented and versioned.

## 6. Data References

- `customers`, `subscriptions`, `services`
- `invoices`, `payments`, `deposits`
- `tickets`, `ticket_events`
- `inventory_items`
- `journal_entries`, `journal_lines`
- `employees` (deferred payroll reports)

## 7. API / Routes

```txt
GET    /api/dashboard
GET    /api/reports/:report
POST   /api/reports/:report/export
GET    /api/reports/exports/:id
GET    /api/reports/schedules
POST   /api/reports/schedules
PATCH  /api/reports/schedules/:id
GET    /api/reports/saved-filters
POST   /api/reports/saved-filters
```

## 8. UI Notes

- Responsive dashboard grid.
- Skeleton loading per widget.
- Charts use `chart-1..5` tokens.
- Filter bar sticky with active filter chips.
- Export progress and download link.
- Empty states with a clear next action.

## 9. Audit & Notifications

Audit events:

- `report.viewed` (sensitive reports)
- `report.exported`
- `report.schedule_created/updated/deleted`
- `report.schedule_failed`

Notifications:

- Export ready.
- Scheduled report delivered.
- Scheduled report failure to owner/admin.

## 10. Acceptance Criteria

```gherkin
Scenario: Branch-scoped dashboard
  Given a branch manager in JKT-01
  When they open the dashboard
  Then all widgets show JKT-01 data only

Scenario: Async export
  Given a report with 50k rows
  When the user exports it
  Then the export is queued
  And a notification is sent when the file is ready

Scenario: Scheduled report
  Given a monthly report schedule
  When the schedule time arrives
  Then the report is generated and delivered
  And the result is logged
```

## 11. Edge Cases & Failure Handling

- Empty data → show zero/empty state, not error.
- Timezone boundary → use Asia/Jakarta.
- Large export → async, never block request.
- Permission change mid-session → re-check on each request.
- Ledger report while posting → read committed snapshot.

## 12. Open Questions

- Which reports are mandatory for v1?
- Is PDF export required for all reports or only invoices?
- Should schedules support WhatsApp delivery?
- What is the export size threshold for async?
