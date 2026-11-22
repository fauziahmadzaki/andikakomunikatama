# 06 — Network & Inventory PRD

## Metadata

| Field | Value |
|---|---|
| Document ID | PRD-06 |
| Version | 1.0 |
| Status | Draft |
| Phase | 1 |
| Dependencies | PRD-01 |
| Related tables | `routers`, `olts`, `passive_devices`, `poles`, `antennas`, `tunnels`, `acs_servers`, `inventory_items`, `inventory_movements` |
| Related ERD | `erd-v2-core.mmd` |

## 1. Summary & Goals

Manage network devices, passive topology, and serialized inventory. Credentials
are stored as secret references, never plaintext. All device changes are
auditable.

### Goals

- Router and OLT registration with connection tests.
- Passive topology: OLT → ODC → ODP, poles, antennas, tunnels.
- ACS server registry.
- Serialized inventory and movement history.
- Device installation and return.
- Credential rotation.
- Topology/map and nearest ODP lookup.

### Non-goals

- Live monitoring dashboards (PRD-12).
- Provisioning workflow (PRD-05).
- Vendor-specific deep configuration (PRD-13 adapters).

## 2. Actors & Permissions

| Actor | Capabilities |
|---|---|
| `owner`, `admin` | Full network and inventory management |
| `noc` | Network devices, topology, credentials, ACS |
| `technician` | Read topology, install/return devices, inventory movement |
| `warehouse` | Inventory CRUD and movement |
| `branch_manager` | Read within branch |

Permissions:

```txt
network.read, network.manage
credential.rotate
inventory.read, inventory.manage, inventory.move
topology.manage
```

## 3. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| NET-01 | Router CRUD with host, API port, username, secret reference, active flag. | M |
| NET-02 | Router connection test records result and last seen. | M |
| NET-03 | OLT CRUD with vendor, model, host, Telnet/SNMP config, secret reference. | M |
| NET-04 | Passive devices support ODP, ODC, splitter, switch, OTB, joint closure. | M |
| NET-05 | Passive devices support parent-child topology and pole association. | M |
| NET-06 | Poles store code, coordinates, address, photo. | M |
| NET-07 | Antennas and tunnels are linked to routers. | S |
| NET-08 | ACS servers store base URL, username, secret reference. | S |
| NET-09 | Inventory items are serialized with SKU, serial number, MAC, status, value. | M |
| NET-10 | Inventory movements record in/out/install/return/adjustment/transfer. | M |
| NET-11 | Device installation links inventory item to service or ticket. | M |
| NET-12 | Credential rotation updates the secret reference and audits. | M |
| NET-13 | Topology view and nearest ODP lookup are available. | S |
| NET-14 | Capacity (ports/customers) is tracked per passive device. | M |

## 4. Workflows

### WF-NET-01 — Add and test router

- Actors: `noc`, `admin`
- Permissions: `network.manage`

Steps:

1. Fill name, branch, host, API port, username, secret reference.
2. Save router.
3. Run connection test through the integration adapter.
4. Store test result and `last_seen_at`.
5. Audit `router.created` / `router.tested`.
6. On failure, keep router inactive and show the error.

Rules:

- Secret values are never returned to the client.
- Duplicate host + port is warned or blocked.
- Router must belong to an active branch.

### WF-NET-02 — Add OLT

- Actors: `noc`, `admin`
- Permissions: `network.manage`

Steps:

1. Fill name, branch, vendor, model, host, Telnet/SNMP ports, version,
   username, secret reference.
2. Save OLT.
3. Test Telnet/SNMP connectivity.
4. Audit `olt.created` / `olt.tested`.
5. OLT becomes selectable for passive devices and services.

Validation:

- Vendor from canonical list or `other`.
- Ports 1–65535.
- SNMP version supported values.

### WF-NET-03 — Build passive topology

- Actors: `noc`, `admin`, `technician`
- Permissions: `topology.manage`

Steps:

1. Create device with type, code, name, branch, coordinates, photo.
2. Select parent device (ODC for ODP, OLT for ODC) and pole if applicable.
3. Set capacity.
4. Validate no cycles in parent-child relationships.
5. Save; audit `passive_device.created` / `updated`.
6. Update capacity counters.

Rules:

- Code unique.
- Parent must be in the same branch.
- ODP capacity cannot be lower than current used capacity.
- Deleting a device with children or active services is blocked.

### WF-NET-04 — Inventory item and movement

- Actors: `warehouse`, `admin`, `technician`
- Permissions: `inventory.manage`, `inventory.move`

Steps:

1. Create item: SKU, name, category, serial number, MAC, branch, purchase
   price, purchase date.
2. Validate serial number uniqueness.
3. Record initial movement `in`.
4. Move item: type `out`, `in`, `transfer`, `adjustment`, `return`.
5. Each movement stores reference, actor, time, photo, notes.
6. Update item status and branch.
7. Audit `inventory.moved`.

Rules:

- Serialized item has one current branch/status.
- Transfer requires both from/to branch.
- Adjustment requires reason.

### WF-NET-05 — Install device

- Actors: `technician`, `admin`
- Permissions: `inventory.move`
- Trigger: installation or ticket

Steps:

1. Select inventory item in stock.
2. Select service/customer or ticket.
3. Validate item branch and status.
4. Create movement `installed` with reference type/id.
5. Set item status `installed`.
6. Optionally link to `ticket_devices`.
7. Audit `inventory.installed`.

Return flow:

1. Select installed item and ticket.
2. Create movement `returned`.
3. Set item status `in_stock`.
4. Update ticket device action.

### WF-NET-06 — Credential rotation

- Actors: `noc`, `admin`
- Permissions: `credential.rotate`

Steps:

1. Select device.
2. Enter new credential or generate one.
3. Store in Vault/KMS; update `secret_ref`.
4. Test connection.
5. Audit `credential.rotated` without logging the secret.
6. Notify NOC on failure.

Rules:

- Never display stored secrets.
- Rotation is transactional with the device update.
- Old secret is destroyed after successful test.

### WF-NET-07 — Topology and nearest ODP

- Actors: `noc`, `technician`, `admin`
- Trigger: map or customer installation

Steps:

1. Render devices by branch and type.
2. Show parent-child links and capacity.
3. Given customer coordinates, compute nearest ODP with available capacity.
4. Show distance and route estimate.
5. Open device detail from the map.

### WF-NET-08 — ACS synchronization

- Actors: `noc`, `admin`
- Trigger: manual sync or scheduled job

Steps:

1. Call ACS adapter for device list.
2. Match by serial number/MAC.
3. Create/update inventory or service metadata.
4. Record sync result in `integration_logs`.
5. Audit `acs.synced`.
6. Report unmatched devices.

## 5. State Models

### Router/OLT

`inactive` → `active` → `maintenance` → `retired`

### Inventory item

`in_stock` → `installed` → `returned` → `damaged` / `retired`

### Service link

`unlinked` → `linked` → `unlinked`

## 6. Data References

- `routers`, `olts`, `poles`, `passive_devices`
- `antennas`, `tunnels`, `acs_servers`
- `inventory_items`, `inventory_movements`
- `services`, `tickets` (references)
- `integration_logs` (sync)

## 7. API / Routes

```txt
GET    /api/routers
POST   /api/routers
PATCH  /api/routers/:id
POST   /api/routers/:id/test
GET    /api/olts
POST   /api/olts
PATCH  /api/olts/:id
POST   /api/olts/:id/test
GET    /api/passive-devices
POST   /api/passive-devices
PATCH  /api/passive-devices/:id
GET    /api/poles
POST   /api/poles
GET    /api/inventory
POST   /api/inventory
POST   /api/inventory/:id/movements
GET    /api/inventory/movements
POST   /api/credentials/rotate
GET    /api/topology
GET    /api/topology/nearest-odp
POST   /api/acs/sync
```

## 8. UI Notes

- Device list grouped by type and branch.
- Secret fields show "configured" state, never the value.
- Inventory movement timeline per item.
- Topology map with capacity indicators.
- Installation flow accessible from ticket detail.
- Destructive actions blocked with clear dependency messages.

## 9. Audit & Notifications

Audit events:

- `router.created/updated/tested`
- `olt.created/updated/tested`
- `passive_device.created/updated`
- `inventory.item_created/moved/installed/returned`
- `credential.rotated`
- `acs.synced`

Notifications:

- Device down/test failure to NOC.
- Low inventory threshold (optional).
- Credential rotation failure.

## 10. Acceptance Criteria

```gherkin
Scenario: Router test failure
  Given an unreachable router host
  When NOC tests the connection
  Then the router is not marked active
  And the failure is recorded
  And no secret is exposed

Scenario: ODP capacity
  Given an ODP with capacity 8 and 8 used ports
  When a technician assigns another service
  Then the assignment is blocked with a capacity error

Scenario: Device installation
  Given an in-stock inventory item
  When a technician installs it for a ticket
  Then the item becomes installed
  And an inventory movement is recorded
```

## 11. Edge Cases & Failure Handling

- Duplicate serial number → block.
- Device moved to another branch with active services → block or require transfer.
- Parent topology cycle → reject.
- Concurrent capacity update → row lock.
- ACS sync duplicate → idempotent by serial/MAC.

## 12. Open Questions

- Are antennas/tunnels required for v1 or can they ship in v1.1?
- Should inventory support non-serialized consumables (cable, connectors)?
- Is GPS coordinate required for poles/ODP?
- Which device types need capacity tracking beyond ODP?
