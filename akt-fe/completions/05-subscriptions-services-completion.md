# 05 — Subscriptions & Services Completion Report

## Metadata

| Field | Value |
|---|---|
| PRD | `docs/prd/05-subscriptions-services-prd.md` |
| Feature | `src/features/subscriptions` |
| Branch | `feat/subscriptions-services` |
| Status | Prototype complete |
| Verification | `npm run lint` only |

## Delivered

### Routes

```txt
/dashboard/langganan
/dashboard/langganan/[id]
/dashboard/langganan/isolir
/dashboard/langganan/migrasi
```

### Subscription list

- Search by number, customer, or plan.
- Status filter: draft, active, suspended, terminated.
- Stats: total, active, suspended, MRR.
- Row actions: view, suspend, reactivate, terminate.
- Create subscription dialog with customer, plan, branch, due day, sales.

### Subscription detail

- Header with status and lifecycle actions.
- Plan, monthly fee, due day, outstanding.
- Service table with provision action.
- Add service dialog (PPPoE, hotspot, static, IPTV).
- Plan change dialog with target price.
- Status history timeline.
- Suspend/reactivate/terminate dialog with reason.

### Suspension batch

- Candidate list with outstanding, due date, grace period.
- Selection checkboxes.
- Batch run marks subscriptions and services suspended.
- Per-candidate result.

### Subscription migration

- Source plan, target plan, branch filter.
- Preview affected subscriptions with price differences.
- Commit updates plan and monthly fee.

### Technical

- Data: subscriptions, services, status history, suspension candidates.
- Zustand subscription store with audit logging.
- Hooks: `useSubscriptionsPage`, `useSubscriptionDialog`,
  `useSubscriptionDetail`, `useServiceProvision`, `useSubscriptionPlanChange`,
  `useSuspensionBatch`, `useSubscriptionMigration`.
- Components: `SubscriptionsPage`, `SubscriptionsTable`, `SubscriptionDialog`,
  `SubscriptionDetailPage`, `ServicesTable`, `ServiceProvisionDialog`,
  `SubscriptionPlanChangeDialog`, `SubscriptionActionDialog`,
  `SubscriptionStatusTimeline`, `SuspensionBatchPage`,
  `SuspensionPreviewTable`, `SubscriptionMigrationPage`.
- shadcn Select, DataTable, ActionIconButton + tooltip, ConfirmationDialog.

## User revisions applied

- PascalCase component files and camelCase hooks.
- Page logic moved into hooks.
- shadcn Select for all dropdowns.
- Reusable DataTable for lists and histories.
- Icon-only table actions with tooltips and `aria-label`.
- Shared ConfirmationDialog.
- Lint-only verification.

## Known limitations

- Provisioning is simulated; no router/OLT adapter call.
- Auto-suspension is a manual batch run, not a scheduled job.
- Payment-triggered reactivation is not connected to payments.
- Plan change does not create a prorated adjustment invoice.
- Multiple active subscriptions per customer are allowed by the prototype.

## Phase 1 ERD alignment

- `Subscription` now uses `customerId`, `planId`, `branchId`, `discountId`,
  `salesEmployeeId`, `priceSnapshot`, `prorateEnabled`, and `taxEnabled`.
- Removed denormalized customer, branch, plan, sales, and outstanding fields
  from the subscription entity; a `SubscriptionView` is built in hooks for UI.
- `SubscriptionService` now uses `routerId`, `oltId`, and `passiveDeviceId`.
- Added `ServiceCredential` entity with `credentialType`, `username`,
  `secretRef`, and `isActive`.
- Subscription detail has a credential table and rotation dialog.
- Service provision dialog selects router, OLT, and ODP from the network
  store and creates the credential separately.
- Plan change updates `priceSnapshot`; billing generation reads the snapshot.
- Persisted subscription store key bumped to `muranet-subscriptions-v2`.
