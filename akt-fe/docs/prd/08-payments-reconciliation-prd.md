# 08 — Payments, Deposits & Reconciliation PRD

## Metadata

| Field | Value |
|---|---|
| Document ID | PRD-08 |
| Version | 1.0 |
| Status | Draft |
| Phase | 1 |
| Dependencies | PRD-07 |
| Related tables | `payments`, `payment_allocations`, `payment_proofs`, `deposits`, `deposit_transactions`, `sales_deposits`, `payment_gateway_*`, `bank_accounts` |
| Related ERD | `erd-v2-finance.mmd` |

## 1. Summary & Goals

Record, verify, allocate, and reconcile payments. Support partial payments,
multi-invoice allocation, customer deposits, sales cash settlement, and payment
gateway callbacks.

### Goals

- Cash/transfer/gateway/deposit payment recording.
- Payment proof upload and verification.
- Allocation across one or more invoices.
- Deposit top-up and usage.
- Sales deposit settlement.
- Idempotent gateway callbacks.
- Reconciliation and refund/void.

### Non-goals

- Invoice generation (PRD-07).
- Accounting report design (PRD-10).
- Collection agency workflows.

## 2. Actors & Permissions

| Actor | Capabilities |
|---|---|
| `finance` | Full payment, verification, reconciliation, refund |
| `admin`, `branch_manager` | Record and verify payments within branch |
| `cs` | Record payment within branch |
| `sales` | Record cash payment for own customers |
| `customer` | Pay online (portal deferred) |

Permissions:

```txt
payment.read, payment.create, payment.verify, payment.void
payment.allocate
deposit.read, deposit.manage
sales_deposit.read, sales_deposit.verify
reconciliation.manage
```

## 3. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| PAY-01 | Record payment with customer, method, amount, bank account, date, reference. | M |
| PAY-02 | Payment can be allocated to one or more invoices. | M |
| PAY-03 | Partial payment updates invoice status to `partial`. | M |
| PAY-04 | Payment proof upload and verification. | M |
| PAY-05 | Verified payment triggers invoice recalc and reactivation check. | M |
| PAY-06 | Customer deposit supports top-up, usage, refund, and adjustment. | M |
| PAY-07 | Sales deposit tracks amount due, paid, proof, and verification. | M |
| PAY-08 | Payment gateway callback is idempotent and signature-verified. | M |
| PAY-09 | Reconciliation matches bank/gateway transactions to payments. | S |
| PAY-10 | Refund/void requires reason and approval. | M |
| PAY-11 | Every payment mutation posts to the ledger (PRD-10). | M |
| PAY-12 | All payment actions are audited. | M |

## 4. Workflows

### WF-PAY-01 — Record payment

- Actors: `cs`, `admin`, `finance`, `sales`
- Permissions: `payment.create`

Steps:

1. Select customer and show outstanding invoices.
2. Choose method: cash, bank transfer, payment gateway, deposit.
3. Enter amount, paid date, bank account, external reference.
4. Upload proof (optional for cash, required for transfer).
5. Preview allocation across selected invoices.
6. Save payment as `pending` (or `verified` for cash with permission).
7. Create allocations and update invoice paid amounts.
8. Post journal entry (or enqueue).
9. Trigger reactivation check (PRD-05).
10. Audit `payment.created`.

Rules:

- Amount > 0.
- Allocation total cannot exceed payment amount.
- Invoice allocation cannot exceed invoice remaining balance.
- Payment number generated transactionally.
- Cash payment may auto-verify if actor has `payment.verify`.

### WF-PAY-02 — Upload and verify payment proof

- Actors: `cs`, `finance`, `admin`
- Permissions: `payment.verify`

Steps:

1. Upload proof through WF-FND-05.
2. Attach to payment.
3. Verifier reviews amount, date, reference, and proof.
4. Approve → payment `verified`; reject → `rejected` with reason.
5. On verify: recalc invoices, post ledger, trigger reactivation.
6. Audit `payment.verified` / `payment.rejected`.
7. Notify customer.

Failure cases:

- Amount mismatch → reject with reason or adjust before verify.
- Duplicate proof/reference → warn and block.
- Missing proof for transfer → block verification.

### WF-PAY-03 — Allocate partial and multi-invoice payment

- Actors: `finance`, `admin`, `cs`
- Permissions: `payment.allocate`

Steps:

1. List open invoices for the customer, oldest first.
2. Auto-allocate option: oldest due date first.
3. Manual allocation per invoice.
4. Validate total allocation <= payment amount.
5. Save allocations.
6. Recalculate each invoice: `paid_amount`, status (`partial`/`paid`).
7. Audit `payment.allocated`.

Rules:

- Overpayment may become a customer deposit if configured.
- Unallocated amount is flagged for review.
- Invoice status changes are idempotent.

### WF-PAY-04 — Deposit top-up and usage

- Actors: `finance`, `admin`, `cs`
- Permissions: `deposit.manage`

Steps:

1. Select customer deposit.
2. Top-up: create `deposit_transactions` type `top_up`, increase balance.
3. Usage: create transaction `usage`, decrease balance, allocate to invoice.
4. Refund: create transaction `refund`, decrease balance, require approval.
5. Adjustment: requires reason and permission.
6. Audit each transaction.
7. Ledger posting for top-up/refund.

Rules:

- Balance cannot go negative.
- Deposit usage creates a payment or allocation record for traceability.
- Security deposit is refundable only after termination.

### WF-PAY-05 — Sales deposit settlement

- Actors: `sales`, `finance`, `branch_manager`
- Permissions: `sales_deposit.verify`

Steps:

1. System calculates cash collected by sales for a period.
2. Sales submits deposit with amount, date, proof.
3. Finance verifies against payments and bank account.
4. Mark `verified`; update sales incentive eligibility.
5. Discrepancy → `partial` or `disputed` status with notes.
6. Audit `sales_deposit.verified`.
7. Notify sales.

Rules:

- Incentive is calculated only from verified deposits.
- Deposit cannot exceed recorded cash unless adjustment is approved.

### WF-PAY-06 — Payment gateway callback

- Actors: system
- Trigger: provider webhook
- Permissions: system

Steps:

1. Verify signature and provider configuration.
2. Find payment by external reference.
3. If already processed, return 200 (idempotent).
4. Validate amount and status.
5. Mark payment `verified` or `failed`.
6. Allocate to invoice(s).
7. Post ledger and trigger reactivation.
8. Store raw callback in `payment_gateway_transactions`.
9. Audit `payment.gateway_callback`.

Rules:

- Idempotent on `(provider, external_id)`.
- Never trust client-provided amount.
- Reject unknown provider/reference with a logged warning.
- Callback processing must be safe under retries and out-of-order events.

### WF-PAY-07 — Reconciliation

- Actors: `finance`
- Permissions: `reconciliation.manage`
- Trigger: bank statement or gateway settlement import

Steps:

1. Import bank/gateway transactions.
2. Match by reference, amount, date, and customer.
3. Show matched, unmatched, and duplicate candidates.
4. Resolve manually: link, create payment, or mark ignored.
5. Record reconciliation status.
6. Audit `reconciliation.completed`.
7. Export mismatch report.

Rules:

- Reconciliation never mutates verified payment amounts silently.
- Adjustments create a new transaction with audit.

### WF-PAY-08 — Refund or void payment

- Actors: `finance`, `owner`
- Permissions: `payment.void`

Steps:

1. Request refund/void with reason.
2. Check invoice allocations and ledger impact.
3. Post reversal journal entry.
4. Restore invoice balances/status.
5. Create refund transaction or mark payment void.
6. Audit `payment.refunded` / `payment.voided`.
7. Notify customer.

Rules:

- Requires approval above a configurable amount.
- Idempotent; duplicate requests return the existing result.
- Refund cannot exceed verified payment amount.

## 5. State Models

### Payment

`pending` → `verified` → `void`

`pending` → `rejected`

### Sales deposit

`pending` → `verified` / `partial` / `disputed`

### Reconciliation

`imported` → `matched` / `unmatched` → `resolved`

## 6. Data References

- `payments`, `payment_allocations`, `payment_proofs`
- `invoices`, `customers`, `bank_accounts`
- `deposits`, `deposit_transactions`
- `sales_deposits`
- `payment_gateway_configs`, `payment_gateway_transactions`
- `journal_entries`, `journal_lines`
- `files`, `attachments`

## 7. API / Routes

```txt
GET    /api/payments
POST   /api/payments
GET    /api/payments/:id
POST   /api/payments/:id/proofs
POST   /api/payments/:id/verify
POST   /api/payments/:id/reject
POST   /api/payments/:id/allocations
POST   /api/payments/:id/refund
POST   /api/payments/:id/void
GET    /api/deposits
POST   /api/deposits/:id/transactions
GET    /api/sales-deposits
POST   /api/sales-deposits
POST   /api/sales-deposits/:id/verify
POST   /api/webhooks/payment-gateway/:provider
GET    /api/reconciliation
POST   /api/reconciliation/import
POST   /api/reconciliation/:id/resolve
```

## 8. UI Notes

- Payment form shows outstanding invoices and auto-allocation.
- Proof preview with zoom/download.
- Clear partial-payment messaging.
- Deposit balance card on customer 360.
- Reconciliation table with match confidence.
- Refund/void requires typed confirmation and reason.

## 9. Audit & Notifications

Audit events:

- `payment.created`, `payment.verified`, `payment.rejected`
- `payment.allocated`, `payment.refunded`, `payment.voided`
- `deposit.topped_up`, `deposit.used`, `deposit.refunded`
- `sales_deposit.verified`
- `payment.gateway_callback`
- `reconciliation.imported`, `reconciliation.resolved`

Notifications:

- Payment received.
- Payment rejected with reason.
- Refund processed.
- Sales deposit reminder.

## 10. Acceptance Criteria

```gherkin
Scenario: Partial payment
  Given an invoice of 150000
  When a verified payment of 100000 is recorded
  Then the invoice is partial
  And the remaining balance is 50000
  And the ledger is balanced

Scenario: Gateway callback idempotency
  Given a successful gateway callback
  When the same callback is delivered twice
  Then the payment is verified once
  And the second response is 200 without side effects

Scenario: Deposit usage
  Given a customer deposit balance of 200000
  When they use 150000 for an invoice
  Then the deposit balance becomes 50000
  And a usage transaction is recorded
```

## 11. Edge Cases & Failure Handling

- Payment amount exceeds outstanding → excess to deposit or review.
- Duplicate external reference → block or flag.
- Gateway out-of-order events → ignore stale status.
- Ledger failure after payment verify → retry queue and flag.
- Refund after invoice void → reconcile both.
- Concurrent allocation to same invoice → row lock.

## 12. Open Questions

- Should overpayment automatically become a deposit in v1?
- Which gateway providers are in v1 scope?
- Is reconciliation import manual or API-based in v1?
- What is the refund approval threshold?
