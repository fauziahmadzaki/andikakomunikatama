# 12 — Reporting & Dashboards Completion Report

## Metadata

| Field | Value |
|---|---|
| PRD | `docs/prd/12-reporting-dashboards-prd.md` |
| Feature | `src/features/reports` |
| Branch | `feat/reports` |
| Status | Prototype complete |
| Verification | `npm run lint` only |

## Delivered

### Route

```txt
/dashboard/laporan
```

### Reports

- Branch filter.
- KPI cards: customers, active subscriptions, revenue, outstanding.
- Report catalog: customers, subscriptions, invoices, payments, tickets.
- Each report shows a value, export action, and link to the source module.
- Client-side export mock feedback.

### Technical

- Derived data from customer, subscription, billing, payment, ticket, and branch
  stores.
- Hook: `useReportsPage`.
- Component: `ReportsPage`.
- shadcn Select for branch filter.

## User revisions applied

- PascalCase component and camelCase hook.
- Logic in hook.
- shadcn Select for branch filter.
- Lint-only verification.

## Known limitations

- Exports are simulated; no real CSV/PDF generation.
- No scheduled reports.
- No drilldown or saved filters.
- Financial metrics are derived from mock cash/payment data.
