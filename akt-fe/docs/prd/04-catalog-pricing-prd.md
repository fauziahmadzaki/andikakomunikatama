# 04 — Catalog, Pricing & Discounts PRD

## Metadata

| Field | Value |
|---|---|
| Document ID | PRD-04 |
| Version | 1.0 |
| Status | Draft |
| Phase | 1 |
| Dependencies | PRD-01 |
| Related tables | `plans`, `plan_prices`, `plan_branches`, `discounts`, `discount_scopes`, `subscriptions` |
| Related ERD | `erd-v2-core.mmd` |

## 1. Summary & Goals

Define internet plans, their price history, branch availability, and discounts.
Prices are effective-dated so historical invoices never change. Discounts use a
single model with scopes instead of five legacy forms.

### Goals

- Plan CRUD with connection and billing type.
- Effective-dated price history.
- Branch availability.
- Discount definition and scope.
- Prorate and tax preview.
- Bulk migration of plan assignments.

### Non-goals

- Subscription creation (PRD-05).
- Invoice generation (PRD-07).
- Tax filing/e-Faktur.

## 2. Actors & Permissions

| Actor | Capabilities |
|---|---|
| `owner`, `admin` | Full plan and discount management |
| `branch_manager` | Read plans, request price changes |
| `cs`, `sales` | Read plans and discounts |
| `finance` | Read plans, prices, discounts |

Permissions:

```txt
plan.read, plan.create, plan.update
plan_price.manage
plan_branch.manage
discount.read, discount.create, discount.update
```

## 3. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| CAT-01 | Plan has code, name, description, connection type, billing type, active flag. | M |
| CAT-02 | Plan code is unique and immutable. | M |
| CAT-03 | Prices are effective-dated and never overwrite history. | M |
| CAT-04 | A plan can be available in multiple branches. | M |
| CAT-05 | Discount supports percentage or fixed amount. | M |
| CAT-06 | Discount scopes: all, branch, plan, plan + branch, customer. | M |
| CAT-07 | Discounts have start/end dates and can be deactivated. | M |
| CAT-08 | Prorate preview calculates first-month charge. | M |
| CAT-09 | Tax preview applies PPN after discount. | M |
| CAT-10 | Price/prorate/tax changes are audited. | M |
| CAT-11 | Bulk plan migration supports preview and affected count. | S |
| CAT-12 | Plans cannot be hard-deleted if referenced. | M |

## 4. Workflows

### WF-CAT-01 — Create/update plan

- Actors: `owner`, `admin`
- Permissions: `plan.create`, `plan.update`

Steps:

1. Fill code, name, description, connection type, billing type.
2. Select available branches.
3. Add initial price with effective date.
4. Validate code uniqueness and branch availability.
5. Save plan + price + branches in one transaction.
6. Audit `plan.created` / `plan.updated`.
7. Publish plan to operational dropdowns.

Rules:

- `connection_type`: `pppoe`, `hotspot`, `static`, `iptv`, `other`.
- `billing_type`: `monthly`, `non_monthly`.
- Inactive plans cannot be selected for new subscriptions.

### WF-CAT-02 — Publish price change

- Actors: `owner`, `admin`
- Permissions: `plan_price.manage`
- Trigger: price increase/decrease

Steps:

1. Select plan and new price.
2. Set effective date (today or future).
3. Close the previous price row (`effective_to = new_date - 1 day`).
4. Insert new `plan_prices` row.
5. Preview affected subscriptions.
6. Save; audit `plan.price_changed`.
7. Existing subscriptions keep `price_snapshot`; new invoices use the new
   price unless the subscription is explicitly migrated.

Rules:

- No overlapping effective periods.
- Price must be >= 0.
- Historical invoices are never recalculated.

### WF-CAT-03 — Manage branch availability

- Actors: `owner`, `admin`
- Permissions: `plan_branch.manage`

Steps:

1. Select plan.
2. Add/remove branches.
3. Prevent removal if active subscriptions exist in that branch.
4. Save; audit.
5. Update availability cache.

### WF-CAT-04 — Create/update discount

- Actors: `owner`, `admin`
- Permissions: `discount.create`, `discount.update`

Steps:

1. Fill code, name, method, value, start/end dates.
2. Validate percentage `0..100` or fixed `>= 0`.
3. Configure scope (WF-CAT-05).
4. Save; audit `discount.created` / `discount.updated`.
5. Discount becomes selectable for matching subscriptions.

Rules:

- Discount code unique.
- Expired discounts cannot be applied to new subscriptions.
- Percentage discount is calculated from plan price, not total invoice.

### WF-CAT-05 — Configure discount scope

- Actors: `owner`, `admin`
- Permissions: `discount.update`

Steps:

1. Choose scope type: `all`, `branch`, `plan`, `plan_branch`, `customer`.
2. Fill only the target fields required by that scope.
3. Validate that exactly one target is populated.
4. Save `discount_scopes` rows.
5. Audit `discount.scope_changed`.

Rules:

- `all` has no target.
- `branch` requires `branch_id`.
- `plan` requires `plan_id`.
- `plan_branch` requires both.
- `customer` requires `customer_id`.

### WF-CAT-06 — Preview prorate and tax

- Actors: `cs`, `finance`, `admin`
- Trigger: plan selection in customer/subscription flow

Steps:

1. Input plan, registration date, due day, prorate flag, tax flag, discount.
2. Calculate active days:
   `active_days = last_day_of_month - registration_day + 1`.
3. Prorate = `ceil(active_days / days_in_month * price)` (configurable
   rounding).
4. Apply discount before tax.
5. Tax = `(price - discount) * tax_rate`.
6. Return breakdown: base, prorate, discount, tax, total.
7. Do not persist the preview.

Rules:

- Prorate only for monthly plans and registration month.
- Tax rate from settings (default 11%).
- If tax flag is false, tax is 0.

### WF-CAT-07 — Bulk plan migration

- Actors: `owner`, `admin`
- Permissions: `plan.update`
- Trigger: plan replacement

Steps:

1. Select source plan and target plan.
2. Filter subscriptions by branch, due day, status.
3. Preview affected subscriptions and price differences.
4. Confirm; run asynchronously in batches.
5. Update `subscriptions.plan_id` and `price_snapshot`.
6. Write `subscription_status_history` or migration log.
7. Audit `plan.bulk_migrated` with counts.
8. Notify completion.

Rules:

- Idempotent per `migration_id`.
- No change to historical invoices.
- Failed rows are reported and retryable.

## 5. Calculations

```txt
base = plan_price
prorate = ceil(active_days / days_in_month * base)
discount = method == percentage ? discounted_amount * value / 100 : value
taxable = prorate - discount
tax = tax_enabled ? taxable * tax_rate / 100 : 0
total = taxable + tax
```

All money uses `numeric(14,2)`; rounding rules are configurable.

## 6. Data References

- `plans`, `plan_prices`, `plan_branches`
- `discounts`, `discount_scopes`
- `subscriptions` (read/update during migration)

## 7. API / Routes

```txt
GET    /api/plans
POST   /api/plans
GET    /api/plans/:id
PATCH  /api/plans/:id
POST   /api/plans/:id/prices
GET    /api/plans/:id/availability
PUT    /api/plans/:id/availability
GET    /api/discounts
POST   /api/discounts
PATCH  /api/discounts/:id
POST   /api/pricing/preview
POST   /api/plans/:id/bulk-migration
```

## 8. UI Notes

- Price history shown as a timeline.
- Effective date picker prevents overlapping ranges.
- Discount scope form switches fields based on scope type.
- Prorate preview shows the formula and active days.
- Bulk migration uses a preview table before commit.

## 9. Audit & Notifications

Audit events:

- `plan.created`, `plan.updated`
- `plan.price_changed`
- `plan.availability_changed`
- `discount.created`, `discount.updated`, `discount.deactivated`
- `plan.bulk_migrated`

Notifications: optional price-change notice to affected customers (PRD-11).

## 10. Acceptance Criteria

```gherkin
Scenario: Price history is preserved
  Given a plan priced at 150000 effective 1 Jan
  When an admin sets a new price effective 1 Mar
  Then the Jan price row ends on 28 Feb
  And a new price row starts on 1 Mar
  And historical invoices remain unchanged

Scenario: Discount before tax
  Given a plan price of 150000 and a 10% discount
  And PPN is 11%
  When the preview is calculated
  Then discount is 15000
  And tax is 14850
  And total is 149850
```

## 11. Edge Cases & Failure Handling

- Overlapping price periods → reject.
- Price change with same effective date → replace only with explicit confirmation.
- Discount fixed amount greater than price → clamp to price.
- Removing a branch with active subscriptions → block.
- Bulk migration interrupted → resume from checkpoint.

## 12. Open Questions

- Is rounding always ceiling, or configurable per plan?
- Should prorate use calendar days or 30-day months?
- Are discounts stackable? (v1 assumes one discount per subscription.)
