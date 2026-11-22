# 07 — Billing & Invoicing PRD

## Metadata

| Field | Value |
|---|---|
| Document ID | PRD-07 |
| Version | 1.0 |
| Status | Draft |
| Phase | 1 |
| Dependencies | PRD-04, PRD-05 |
| Related tables | `invoices`, `invoice_items`, `subscriptions`, `plans`, `plan_prices`, `discounts`, `customers`, `files` |
| Related ERD | `erd-v2-finance.mmd` |

## 1. Summary & Goals

Generate accurate, idempotent invoices for subscriptions and manual charges.
Invoices are immutable after posting except through explicit void/credit
workflows.

### Goals

- Mass invoice generation with preview and idempotency.
- Manual invoices for non-subscription charges.
- Correct prorate, discount, and PPN.
- Unique invoice numbers.
- PDF invoice with company branding and payment instructions.
- Status tracking and overdue marking.
- Notification resend.

### Non-goals

- Payment recording (PRD-08).
- Accounting journal posting (PRD-10).
- Tax filing/e-Faktur.

## 2. Actors & Permissions

| Actor | Capabilities |
|---|---|
| `owner`, `admin` | Full billing |
| `branch_manager` | Generate/read invoices within branch |
| `finance` | Read all, void with approval, export |
| `cs` | Read and resend within branch |
| `customer` | Read own invoices (portal, deferred) |

Permissions:

```txt
invoice.read, invoice.create, invoice.generate
invoice.void, invoice.export, invoice.resend
```

## 3. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| BILL-01 | Mass generation per period, branch, plan, due day, with preview. | M |
| BILL-02 | Generation is idempotent per subscription + period. | M |
| BILL-03 | Manual invoice supports custom items, due date, period, discount. | M |
| BILL-04 | Invoice items store description, quantity, unit price, discount, tax, total. | M |
| BILL-05 | Prorate applies only to the first monthly invoice. | M |
| BILL-06 | Discount applies before PPN. | M |
| BILL-07 | Invoice number is unique, immutable, and generated transactionally. | M |
| BILL-08 | Invoice status: draft, issued, partial, paid, overdue, void. | M |
| BILL-09 | Overdue marking runs daily and is idempotent. | M |
| BILL-10 | Invoice PDF includes company, customer, items, tax, total, payment instructions, QR. | M |
| BILL-11 | Invoice notification can be resent. | M |
| BILL-12 | Void requires reason and permission; paid invoices cannot be voided without refund. | M |
| BILL-13 | All invoice mutations are audited. | M |
| BILL-14 | Invoice export supports filters and columns. | S |

## 4. Workflows

### WF-BILL-01 — Mass invoice preview

- Actors: `admin`, `branch_manager`, `finance`
- Permissions: `invoice.generate`
- Trigger: billing run screen

Steps:

1. Select period (month/year), branch, plan, due day, and options.
2. Query eligible active subscriptions.
3. Exclude subscriptions with an existing non-void invoice for that period.
4. Calculate each invoice: base, prorate, discount, tax, total.
5. Return summary, total amount, and a sample list.
6. Highlight skipped rows with reasons.
7. Do not write invoices during preview.

Rules:

- Preview uses the same calculation function as commit.
- Duplicate detection is based on `subscription_id + period_start + period_end`.
- Inactive/suspended subscriptions may still be billed depending on policy
  (configurable; default: bill active only).

### WF-BILL-02 — Commit mass invoice

- Actors: `admin`, `branch_manager`
- Permissions: `invoice.generate`
- Trigger: confirm preview
- Idempotency: `billing_run_id`

Steps:

1. Re-query eligible subscriptions inside the job.
2. Skip existing invoices for the same period.
3. For each subscription, create `invoices` + `invoice_items` in a
   transaction.
4. Generate invoice numbers via WF-FND-04.
5. Set status `issued`; `issue_date` and `due_date`.
6. Post the accounting journal entry (PRD-10) or enqueue it.
7. Queue notification events.
8. Record batch result per invoice.
9. Audit `invoice.batch_generated` with counts.
10. Return or notify completion.

Rules:

- Job is idempotent per `billing_run_id` and per subscription/period.
- Partial failure is isolated per invoice; retry failed rows.
- Maximum batch size is configurable.
- Dry-run mode is available.

Failure cases:

- Sequence failure → retry once, then fail the batch item.
- Duplicate invoice → skip and log.
- Journal posting failure → invoice remains `issued` but flagged for retry.

### WF-BILL-03 — Manual invoice

- Actors: `admin`, `finance`, `branch_manager`
- Permissions: `invoice.create`

Steps:

1. Select customer and optional subscription.
2. Add one or more items (description, quantity, unit price, tax flag).
3. Set period, issue date, due date.
4. Apply discount if allowed.
5. Preview totals.
6. Save as draft or issue immediately.
7. Generate number, post journal, queue notification.
8. Audit `invoice.created`.

Rules:

- Manual invoice must have at least one item.
- Non-subscription invoices may have `subscription_id = null`.
- Negative amounts are not allowed; use void/credit instead.

### WF-BILL-04 — Void invoice

- Actors: `finance`, `owner`
- Permissions: `invoice.void`
- Trigger: incorrect invoice

Steps:

1. Request void with reason.
2. Block if the invoice has verified payments; require refund/credit first.
3. Post reversal journal entry (PRD-10).
4. Set status `void`; keep items for audit.
5. Audit `invoice.voided`.
6. Notify customer if the invoice was already sent.

Rules:

- Voided invoices are never deleted.
- A new invoice may be issued for the corrected amount.
- Idempotent: voiding twice returns the same result.

### WF-BILL-05 — Overdue marking

- Actors: system
- Trigger: daily job

Steps:

1. Find invoices `issued` or `partial` with `due_date < today`.
2. Set status `overdue`.
3. Queue reminder notification.
4. Audit `invoice.overdue_marked` (batch).
5. Job is idempotent per day.

### WF-BILL-06 — Invoice PDF

- Actors: authenticated roles with invoice access
- Trigger: download/print

Steps:

1. Verify access and branch scope.
2. Render invoice with company logo, invoice number, customer, items, tax,
   total, payment instructions, and QR verification.
3. Store generated PDF in `files` (optional) with checksum.
4. Return a signed URL or stream.
5. Audit `invoice.pdf_accessed`.

Rules:

- PDFs reflect the immutable invoice snapshot.
- QR payload uses a signed public token, not sequential IDs.
- Sensitive payment details follow company settings.

### WF-BILL-07 — Resend invoice notification

- Actors: `cs`, `admin`
- Permissions: `invoice.resend`

Steps:

1. Select invoice and channel (WhatsApp/email).
2. Verify invoice status is not void.
3. Queue notification with template and invoice link.
4. Audit `invoice.notification_resent`.
5. Show delivery status from notification logs.

## 5. Calculation Rules

```txt
base = subscription.price_snapshot
prorate = first_invoice && prorate_enabled
  ? ceil(active_days / days_in_month * base)
  : base
discount = method == percentage ? prorate * value / 100 : value
taxable = prorate - discount
tax = tax_enabled ? taxable * tax_rate / 100 : 0
total = taxable + tax
```

- All money uses `numeric(14,2)`.
- Due date clamps to the last day of the month.
- PPN is shown as a separate line.
- Rounding mode is configurable; default ceiling for prorate.

## 6. State Models

### Invoice

`draft` → `issued` → `partial` → `paid`

`issued`/`partial` → `overdue`

`draft`/`issued` → `void`

### Billing run

`previewed` → `running` → `completed` / `partial` / `failed`

## 7. Data References

- `invoices`, `invoice_items`
- `subscriptions`, `plans`, `plan_prices`, `discounts`
- `customers`, `company_profiles`, `bank_accounts`
- `files`, `attachments`
- `journal_entries` (posting)

## 8. API / Routes

```txt
GET    /api/invoices
POST   /api/invoices
GET    /api/invoices/:id
POST   /api/invoices/:id/void
GET    /api/invoices/:id/pdf
POST   /api/invoices/:id/resend
GET    /api/billing-runs
POST   /api/billing-runs/preview
POST   /api/billing-runs/:id/commit
GET    /api/billing-runs/:id
POST   /api/invoices/overdue-marking
```

## 9. UI Notes

- Mass generation wizard: filters → preview → commit → result.
- Preview shows counts, totals, skipped rows, and warnings.
- Invoice detail shows status timeline, items, payments, and journal link.
- Void action requires reason and shows payment impact.
- PDF preview before download.

## 10. Audit & Notifications

Audit events:

- `invoice.created`, `invoice.batch_generated`
- `invoice.voided`, `invoice.overdue_marked`
- `invoice.pdf_accessed`, `invoice.notification_resent`
- `billing_run.previewed`, `billing_run.committed`

Notifications:

- Invoice issued.
- Payment reminder before due.
- Overdue reminder.
- Void notification.

## 11. Acceptance Criteria

```gherkin
Scenario: Idempotent mass generation
  Given a billing run for January 2026
  When the job is executed twice
  Then each subscription has one January invoice
  And the second run skips existing invoices

Scenario: Partial payment status
  Given an invoice total of 150000
  When a verified payment of 100000 is allocated
  Then the invoice status becomes partial
  And the remaining balance is 50000

Scenario: Void paid invoice
  Given a paid invoice
  When finance attempts to void it
  Then the request is blocked until a refund or credit is processed
```

## 12. Edge Cases & Failure Handling

- Month-end due date → clamp.
- Subscription suspended mid-period → policy decides full/partial billing.
- Price change during period → use `price_snapshot`.
- Duplicate manual invoice → warn and require confirmation.
- Journal posting failure → invoice flagged and retried.
- Currency rounding → consistent rounding at line and invoice level.

## 13. Open Questions

- Should suspended subscriptions be billed in v1?
- Should there be a credit note entity in v1 or only void + new invoice?
- Is penalty/late fee in v1?
- Should invoice PDFs be stored permanently or generated on demand?
