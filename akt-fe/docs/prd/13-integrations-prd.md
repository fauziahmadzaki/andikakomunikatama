# 13 — Integrations & Device Adapters PRD

## Metadata

| Field | Value |
|---|---|
| Document ID | PRD-13 |
| Version | 1.0 |
| Status | Draft |
| Phase | 1 |
| Dependencies | PRD-05, PRD-06 |
| Related tables | `integration_logs`, `routers`, `olts`, `acs_servers`, `whatsapp_devices`, `telegram_groups`, `mail_settings`, `payment_gateway_configs` |
| Related ERD | `erd-v2-all.mmd` |

## 1. Summary & Goals

Provide a consistent adapter layer for external systems. Integrations must be
observable, retryable, and isolated so a provider failure cannot break core
transactions.

### Goals

- Adapter configuration and secrets.
- Connection tests and health checks.
- Provisioning commands for MikroTik/OLT.
- TR-069 ACS synchronization.
- WhatsApp/Telegram/email delivery.
- Payment gateway callbacks.
- Retry, timeout, circuit breaker, and logs.
- Idempotent operations.

### Non-goals

- PPOB in v1.
- Vendor-specific advanced configuration UI.
- Direct database access to third-party systems.

## 2. Actors & Permissions

| Actor | Capabilities |
|---|---|
| `owner`, `admin` | Adapter configuration |
| `noc` | Network adapters, connection tests |
| `finance` | Payment gateway configuration |
| `cs` | Notification device status (read) |

Permissions:

```txt
integration.read, integration.manage
integration.test
integration.log.read
credential.rotate
```

## 3. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| INT-01 | Adapters are configured with endpoint, credentials (`secret_ref`), and timeout. | M |
| INT-02 | Connection test records result and last checked time. | M |
| INT-03 | All external calls are logged with request/response metadata (secrets redacted). | M |
| INT-04 | Retries use exponential backoff and a maximum attempt count. | M |
| INT-05 | Circuit breaker opens after repeated failures and half-opens for probes. | M |
| INT-06 | Provisioning commands are idempotent by operation key. | M |
| INT-07 | Webhooks verify signatures and are idempotent. | M |
| INT-08 | Credentials are never returned to the client or logged. | M |
| INT-09 | Health status is exposed for operations. | S |
| INT-10 | Adapter failures do not roll back committed business data. | M |

## 4. Adapters

| Adapter | Purpose | Protocol |
|---|---|---|
| MikroTik RouterOS | PPPoE/hotspot/static provisioning, session status, suspend/reactivate | REST/API, SSH |
| OLT | ONU inventory, status, provisioning | Telnet, SNMP |
| GenieACS | TR-069 CPE inventory, status, reboot | REST |
| WhatsApp Gateway | Message delivery | HTTP API |
| Telegram Bot | Ticket/monitoring alerts | Bot API |
| SMTP | Email delivery | SMTP/TLS |
| Payment Gateway | Payment creation, callback, settlement | HTTPS |
| Internal API | Customer app/service integration | REST `/v1` |

## 5. Workflows

### WF-INT-01 — Adapter configuration

- Actors: `admin`, `noc`, `finance` (per adapter type)
- Permissions: `integration.manage`

Steps:

1. Create adapter config with name, type, endpoint, timeout.
2. Store credentials in Vault/KMS; save `secret_ref`.
3. Set retry and circuit breaker policy.
4. Validate required fields per adapter.
5. Audit `integration.configured`.
6. Never return secret values.

### WF-INT-02 — Connection test

- Actors: `admin`, `noc`
- Permissions: `integration.test`

Steps:

1. Select adapter and test action.
2. Execute a safe read-only call.
3. Record latency, status, and error.
4. Update health status.
5. Write `integration_logs`.
6. Audit `integration.tested`.

Rules:

- Tests must not mutate external state.
- Rate limit test calls.
- Secrets are redacted in logs.

### WF-INT-03 — Provisioning command

- Actors: system, `noc`
- Trigger: service provisioning (PRD-05)
- Idempotency: `operation_key`

Steps:

1. Build command from service data.
2. Check circuit breaker state.
3. Execute with timeout.
4. Parse response into a normalized result.
5. Log request/response (redacted).
6. On success, update service state.
7. On failure, classify as retryable or permanent.
8. Retry retryable failures with backoff.

Rules:

- Same `operation_key` must not create duplicate secrets/users.
- Permanent failures require operator action.
- Never log credentials or full config secrets.

### WF-INT-04 — Webhook/callback idempotency

- Actors: external provider
- Trigger: payment callback, delivery status, device event

Steps:

1. Verify signature and timestamp.
2. Find or create an event record by provider + external id.
3. If already processed, return success without side effects.
4. Process within a transaction.
5. Store raw payload (redacted).
6. Return the provider's expected response.

Rules:

- Idempotent on `(provider, external_id, event_type)`.
- Reject stale or invalid signatures.
- Never trust client-provided amounts.

### WF-INT-05 — Retry and circuit breaker

- Actors: system
- Trigger: failed external call

Steps:

1. Classify error (network, timeout, auth, validation, provider).
2. Retry transient errors with exponential backoff and jitter.
3. Stop after max attempts; move to dead-letter queue.
4. Open circuit after consecutive failures.
5. Half-open probe after cooldown.
6. Alert operations on open circuit.

### WF-INT-06 — Credential usage and rotation

- Actors: `noc`, `finance`, `admin`
- Permissions: `credential.rotate`

Steps:

1. Request secret from Vault/KMS at call time.
2. Never cache secrets in logs or client.
3. Rotate through adapter-specific workflow.
4. Test after rotation.
5. Audit `credential.rotated`.
6. Revoke old secret after success.

### WF-INT-07 — Integration log and health

- Actors: `admin`, `noc`
- Permissions: `integration.log.read`

Steps:

1. Filter logs by adapter, status, date, reference.
2. Show latency, retry count, error class.
3. Show circuit state and last success.
4. Manual retry from log (permission required).
5. Audit manual retry.

## 6. State Models

### Integration health

`healthy` → `degraded` → `open` → `half_open` → `healthy`

### Operation

`queued` → `running` → `succeeded` / `retryable_failed` / `permanent_failed`

## 7. Data References

- `integration_logs`
- Adapter tables: `routers`, `olts`, `acs_servers`, `whatsapp_devices`,
  `telegram_groups`, `mail_settings`, `payment_gateway_configs`
- `services`, `payments`, `notification_logs` (references)

## 8. API / Routes

```txt
GET    /api/integrations
POST   /api/integrations
PATCH  /api/integrations/:id
POST   /api/integrations/:id/test
GET    /api/integrations/health
GET    /api/integrations/logs
POST   /api/integrations/logs/:id/retry
POST   /api/webhooks/:provider
```

## 9. UI Notes

- Adapter cards with health badge and last check.
- Configuration form masks secrets.
- Log viewer with redaction and filters.
- Circuit breaker status visible to NOC.
- Retry action with confirmation.

## 10. Audit & Notifications

Audit events:

- `integration.configured`, `integration.tested`
- `integration.command_sent`, `integration.command_failed`
- `integration.circuit_opened`
- `integration.credential_rotated`
- `integration.manual_retry`

Notifications:

- Circuit open alert to NOC.
- Repeated provisioning failures.
- Gateway callback failures.
- Provider device disconnected.

## 11. Acceptance Criteria

```gherkin
Scenario: Duplicate provisioning command
  Given a service already provisioned
  When the same operation key is retried
  Then no duplicate PPPoE secret is created
  And the result is idempotent

Scenario: Circuit breaker
  Given five consecutive provider failures
  When the sixth call is attempted
  Then the circuit is open and the call fails fast
  And an alert is sent to operations

Scenario: Secret redaction
  Given an integration log
  When it is viewed
  Then credentials are masked
```

## 12. Edge Cases & Failure Handling

- Provider timeout after successful mutation → reconcile via read call.
- Out-of-order webhooks → ignore stale events.
- Expired credentials → circuit open + alert.
- Rate limit → queue and retry.
- Partial adapter response → mark unknown and reconcile.

## 13. Open Questions

- Which MikroTik/OLT/ACS versions are in v1 support?
- Is a message queue available for retries?
- Which WhatsApp and payment gateway providers are selected?
- Should the internal API be versioned under `/v1`?
