# 10 — Finance & Accounting PRD

## Metadata

| Field | Value |
|---|---|
| Document ID | PRD-10 |
| Version | 1.0 |
| Status | Draft |
| Phase | 2 |
| Dependencies | PRD-07, PRD-08 |
| Related tables | `account_types`, `chart_of_accounts`, `bank_accounts`, `journal_entries`, `journal_lines`, `incomes`, `expenses`, `petty_cash_funds`, `petty_cash_expenses`, `reimbursements`, `payment_requests`, `contacts`, `purchase_orders`, `purchase_order_items` |
| Related ERD | `erd-v2-finance.mmd` |

## 1. Summary & Goals

Implement full double-entry accounting. Every financial document posts balanced
journal entries. Account balances are derived from the ledger, not stored as
user-editable values.

### Goals

- Chart of accounts and account types.
- Balanced journal entries and lines.
- Income and expense recording.
- Petty cash funds and usage.
- Reimbursement and payment request approvals.
- Contacts and purchase orders.
- Period close and financial reports.

### Non-goals

- Tax filing/e-Faktur automation.
- Multi-currency.
- Consolidation across companies.

## 2. Actors & Permissions

| Actor | Capabilities |
|---|---|
| `finance` | Full accounting |
| `owner` | Full, including period close |
| `branch_manager` | Read own branch financial reports |
| `admin` | Read, create requests |
| `hrd` | Read payroll-related accounts |

Permissions:

```txt
account.read, account.manage
journal.read, journal.create, journal.post, journal.void
income.manage, expense.manage
petty_cash.manage
reimbursement.manage, reimbursement.approve
payment_request.manage, payment_request.approve
contact.manage
purchase_order.manage, purchase_order.approve
period.close
```

## 3. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FIN-01 | Chart of accounts with type, parent, code, and active flag. | M |
| FIN-02 | Journal entry must have at least two lines and balanced debit/credit. | M |
| FIN-03 | Journal entries are immutable after posting; void creates reversal. | M |
| FIN-04 | Source documents store their journal entry reference. | M |
| FIN-05 | Income/expense records post to the ledger. | M |
| FIN-06 | Petty cash fund supports allocation, usage, balance, and status. | M |
| FIN-07 | Reimbursement and payment request follow approval workflows. | M |
| FIN-08 | Purchase orders support items, status, and approval. | S |
| FIN-09 | Period close locks postings for the period. | M |
| FIN-10 | Reports: trial balance, general ledger, P&L, cash flow. | M |
| FIN-11 | All financial mutations are audited. | M |
| FIN-12 | Account balances are derived from journal lines. | M |

## 4. Workflows

### WF-FIN-01 — COA setup

- Actors: `finance`, `owner`
- Permissions: `account.manage`

Steps:

1. Create account types if missing (asset, liability, equity, revenue, expense).
2. Create accounts with code, name, type, parent.
3. Validate code uniqueness and parent type compatibility.
4. Seed standard accounts.
5. Audit `account.created`.

Rules:

- Accounts with journal lines cannot be deleted; deactivate instead.
- Codes are immutable after posting begins.

### WF-FIN-02 — Post journal entry

- Actors: `finance`
- Permissions: `journal.create`, `journal.post`
- Trigger: manual journal or source document

Steps:

1. Create entry header (date, description, source type/id, branch).
2. Add lines with account, debit, credit, memo.
3. Validate exactly one of debit/credit is positive per line.
4. Validate total debit = total credit.
5. Save as `draft` or post immediately.
6. On post: set status `posted`, `posted_by`, `posted_at`.
7. Update source document reference.
8. Audit `journal.posted`.

Rules:

- Balanced entry required.
- No posting to inactive accounts.
- No posting to a closed period.
- Idempotent by `source_type + source_id` for automatic entries.

### WF-FIN-03 — Record income

- Actors: `finance`, `admin`
- Permissions: `income.manage`

Steps:

1. Fill branch, bank account, contact (optional), income type, amount,
   description, received date, proof.
2. Create income record.
3. Post journal: debit bank/cash, credit income account.
4. Link `journal_entry_id`.
5. Audit `income.created`.

### WF-FIN-04 — Record expense

- Actors: `finance`, `admin`
- Permissions: `expense.manage`

Steps:

1. Fill branch, bank account, contact (optional), expense type, amount,
   description, paid date, proof.
2. Create expense record.
3. Post journal: debit expense account, credit bank/cash.
4. Link journal entry.
5. Audit `expense.created`.

### WF-FIN-05 — Petty cash

- Actors: `finance`, `admin`
- Permissions: `petty_cash.manage`

Steps:

1. Create fund with amount, bank account, custodian.
2. Post journal: debit petty cash, credit bank.
3. Record expense: amount, contact, description, proof, date.
4. Validate remaining balance.
5. Post journal: debit expense, credit petty cash.
6. Close/replenish fund with approval.
7. Audit each action.

Rules:

- Cannot spend more than remaining balance.
- Replenishment amount reconciles spent amount.

### WF-FIN-06 — Reimbursement approval

- Actors: employee, `finance`, approver
- Permissions: `reimbursement.manage`, `reimbursement.approve`

Steps:

1. Employee creates request with amount, description, attachment.
2. Approver reviews and approves/rejects.
3. Finance pays; post journal.
4. Set status `paid`, link journal entry.
5. Audit each transition.

State: `draft` → `submitted` → `approved` / `rejected` → `paid`.

### WF-FIN-07 — Payment request approval

- Actors: requester, approver, `finance`
- Permissions: `payment_request.manage`, `payment_request.approve`

Steps:

1. Requester submits amount, contact, bank account, description, attachment.
2. Approval matrix applies based on amount.
3. Approved request can be paid by finance.
4. Post journal; set status `paid`.
5. Audit.
6. Notify requester.

### WF-FIN-08 — Purchase order lifecycle

- Actors: `finance`, `admin`, warehouse
- Permissions: `purchase_order.manage`, `purchase_order.approve`

Steps:

1. Create PO header (contact, dates, notes).
2. Add items (description, quantity, unit price, tax).
3. Calculate total.
4. Submit for approval.
5. Approve or reject.
6. Mark as received when goods arrive.
7. Post journal/inventory movement (PRD-06).
8. Audit each transition.

State: `draft` → `submitted` → `approved` / `rejected` → `received` → `closed`.

### WF-FIN-09 — Period close

- Actors: `owner`, `finance`
- Permissions: `period.close`

Steps:

1. Select period.
2. Validate no draft journals in the period.
3. Generate trial balance and reconcile.
4. Lock period.
5. Audit `period.closed`.
6. Reopening requires owner permission and reason.

Rules:

- Closed periods reject new postings.
- Adjustments use the next open period.

### WF-FIN-10 — Financial report

- Actors: `finance`, `owner`, `branch_manager` (read)
- Permissions: `report.finance`

Steps:

1. Select report and period/branch.
2. Query ledger aggregates.
3. Render trial balance, P&L, cash flow, or general ledger.
4. Export with permission.
5. Audit export.

## 5. Data References

- `account_types`, `chart_of_accounts`, `bank_accounts`
- `journal_entries`, `journal_lines`
- `incomes`, `expenses`
- `petty_cash_funds`, `petty_cash_expenses`
- `reimbursements`, `payment_requests`
- `contacts`, `purchase_orders`, `purchase_order_items`

## 6. API / Routes

```txt
GET    /api/account-types
POST   /api/account-types
GET    /api/chart-of-accounts
POST   /api/chart-of-accounts
PATCH  /api/chart-of-accounts/:id
GET    /api/journal-entries
POST   /api/journal-entries
POST   /api/journal-entries/:id/post
POST   /api/journal-entries/:id/void
GET    /api/incomes
POST   /api/incomes
GET    /api/expenses
POST   /api/expenses
GET    /api/petty-cash
POST   /api/petty-cash
POST   /api/petty-cash/:id/expenses
GET    /api/reimbursements
POST   /api/reimbursements
POST   /api/reimbursements/:id/approve
GET    /api/payment-requests
POST   /api/payment-requests
POST   /api/payment-requests/:id/approve
GET    /api/purchase-orders
POST   /api/purchase-orders
POST   /api/purchase-orders/:id/approve
POST   /api/periods/:id/close
GET    /api/reports/finance
```

## 7. UI Notes

- Journal entry form shows live debit/credit balance.
- Source document links to its journal entry.
- Approval inbox with amount-based routing.
- Period close checklist.
- Reports with drilldown to journal lines.

## 8. Audit & Notifications

Audit events:

- `account.created/updated`
- `journal.created/posted/voided`
- `income.created`, `expense.created`
- `petty_cash.created/spent/replenished`
- `reimbursement.submitted/approved/rejected/paid`
- `payment_request.submitted/approved/rejected/paid`
- `purchase_order.submitted/approved/rejected/received`
- `period.closed/reopened`
- `report.exported`

Notifications:

- Approval requests.
- Payment completed.
- Period closed.
- Budget/threshold alerts (optional).

## 9. Acceptance Criteria

```gherkin
Scenario: Unbalanced journal is rejected
  Given a journal with debit 100 and credit 90
  When finance tries to post it
  Then the request is rejected
  And the entry remains draft

Scenario: Closed period rejects posting
  Given a closed January period
  When finance posts a January journal
  Then the request is rejected

Scenario: Payment request approval
  Given a payment request above the approval threshold
  When the approver approves it
  Then finance can pay it
  And the ledger is updated
```

## 10. Edge Cases & Failure Handling

- Automatic journal duplicate → idempotent by source reference.
- Void posted journal → reversal entry, never delete.
- Petty cash overspend → block.
- Concurrent period close → lock.
- Account deactivation with open balances → warn/block.

## 11. Open Questions

- What is the approval matrix for payment requests and refunds?
- Is trial balance enough for v1, or is a full reporting engine required?
- Should bank reconciliation live here or in PRD-08?
- Are e-Faktur and tax reports deferred?
