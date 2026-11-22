# 07 — Billing & Invoicing Completion Report

## Metadata

| Field | Value |
|---|---|
| PRD | `docs/prd/07-billing-invoicing-prd.md` |
| Feature | `src/features/billing` |
| Branch | `feat/billing` |
| Status | Prototype complete |
| Verification | `npm run lint` only |

## Delivered

### Routes

```txt
/dashboard/tagihan
/dashboard/tagihan/[id]
/dashboard/tagihan/generate
```

### Invoice list

- Search and status filter.
- Stats: total, issued, overdue, outstanding.
- Invoice table with customer, period, due date, total, paid amount, status.
- Row actions: view detail and void.
- Manual invoice dialog with customer, description, amount, due date, and PPN.

### Invoice detail

- Invoice header, status, period, due date, total, paid amount.
- Item table and totals breakdown.
- Void action.

### Mass generation

- Period and branch selection.
- Eligible active subscription preview.
- Idempotent skip for existing invoices per customer/period.
- Generate invoices from subscription plan price and due day.
- Billing run result.

### Technical

- Data: invoices, invoice items, billing runs.
- Zustand billing store with audit logging.
- Hooks: `useInvoicesPage`, `useInvoiceDetail`, `useManualInvoice`,
  `useBillingRun`.
- Components: `InvoicesPage`, `InvoiceDialog`, `InvoiceDetailPage`,
  `BillingRunPage`.
- shadcn Select, DataTable, ActionIconButton + tooltip, ConfirmationDialog.

## User revisions applied

- PascalCase components and camelCase hooks.
- Logic separated into hooks.
- shadcn Select for dropdowns.
- Reusable DataTable.
- Icon-only table actions with tooltips.
- Confirmation dialog for void.
- Lint-only verification.

## Known limitations

- Invoice numbering and period calculation are simplified.
- PDF invoice and QR verification are not implemented.
- Payment allocation is not connected to invoice balances.
- Prorate and discount calculation are simplified.
- No credit note workflow.
