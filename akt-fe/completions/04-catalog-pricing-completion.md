# 04 — Catalog, Pricing & Discounts Completion Report

## Metadata

| Field | Value |
|---|---|
| PRD | `docs/prd/04-catalog-pricing-prd.md` |
| Feature | `src/features/catalog` |
| Branch | `feat/catalog-pricing` |
| Status | Prototype complete |
| Verification | `npm run lint` only |

## Delivered

### Routes

```txt
/dashboard/paket
/dashboard/paket/[id]
/dashboard/paket/diskon
/dashboard/paket/preview
/dashboard/paket/migrasi
```

### Plans

- Plan list with search, current price, branch availability, and status.
- Create/edit plan with:
  - code, name, description
  - connection type and billing type
  - branch availability
  - initial price, effective date, taxable flag
- Activate/deactivate plan.
- Plan detail with price history timeline/table and new price publication.
- Current price helpers.

### Discounts

- Discount list with code, method/value, scope, period, and status.
- Create/edit discount with:
  - percentage or fixed method
  - start/end dates
  - scope: all, branch, plan, plan+branch, customer
- Activate/deactivate discount.

### Pricing preview

- Plan selection, registration date, prorate flag, PPN flag.
- Catalog discount or manual discount.
- Prorate, discount, taxable base, PPN, and total calculation.
- Uses billing tax rate from system settings.

### Bulk plan migration

- Source plan, target plan, affected subscription preview.
- Commit updates subscriptions to the target plan.
- Uses subscription store for preview and commit.

### Technical

- Data: plans, plan prices, discounts, pricing calculator.
- Zustand catalog store with audit logging.
- Hooks: `usePlansPage`, `usePlanDialog`, `usePlanDetail`,
  `useDiscountsPage`, `usePricingPreview`, `useBulkPlanMigration`.
- Components: `PlansPage`, `PlansTable`, `PlanDialog`, `PlanDetailPage`,
  `PlanPriceDialog`, `DiscountsPage`, `DiscountsTable`, `DiscountDialog`,
  `PricingPreviewPage`, `BulkPlanMigrationPage`.
- shadcn Select, DataTable, ActionIconButton + tooltip, ConfirmationDialog.

## User revisions applied

- PascalCase component files, camelCase hooks.
- Logic separated into hooks.
- shadcn Select for all dropdowns.
- Reusable DataTable for plans, prices, discounts, and migration preview.
- Icon-only table actions with tooltips and `aria-label`.
- Confirmation dialog for status changes.
- Lint-only verification.

## Known limitations

- All data is mocked; no API or persistence beyond localStorage.
- Plan code uniqueness is not enforced in the prototype.
- Bulk migration only changes plan and price; it does not create prorated
  adjustment invoices.
- Discount stacking and approval workflows are not implemented.
- Price history effective-date overlap prevention is simplified.

## Phase 1 ERD alignment

- `Plan` no longer stores `branchIds`; plan availability is stored as
  `planBranches` rows matching `plan_branches`.
- `Discount` no longer stores a single scope. Discount scopes are stored as
  `discountScopes` rows matching `discount_scopes`.
- Discount dialog supports adding multiple scopes (`all`, `branch`, `plan`,
  `plan_branch`, `customer`) with target selectors.
- Plan dialog reads and writes branch availability through the join rows.
- Plan list and detail resolve branch counts/names from `planBranches`.
- Persisted catalog store key bumped to `muranet-catalog-v2` because the
  entity shape changed.
