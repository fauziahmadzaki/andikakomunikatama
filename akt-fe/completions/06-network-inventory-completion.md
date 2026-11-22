# 06 — Network & Inventory Completion Report

## Metadata

| Field | Value |
|---|---|
| PRD | `docs/prd/06-network-inventory-prd.md` |
| Feature | `src/features/network` |
| Branch | `feat/network-inventory` |
| Status | Prototype complete |
| Verification | `npm run lint` only |

## Delivered

### Routes

```txt
/dashboard/jaringan
/dashboard/jaringan/perangkat
/dashboard/jaringan/inventaris
/dashboard/jaringan/topologi
```

### Network overview

- Stats: active routers, active OLTs, passive devices, in-stock inventory.
- Router table with test action and credential rotation.
- OLT table with test action and credential rotation.
- ACS server card with sync action.
- Add router and add OLT dialogs.

### Passive devices

- Tabs for passive devices, poles, antennas, and tunnels.
- Passive device list with type, branch, parent, OLT, capacity usage, and
  coordinates.
- Add passive device dialog with parent, OLT, pole, capacity, and coordinates.
- Read-only tables for poles, antennas, and tunnels.

### Inventory

- Stats: total items, in stock, installed, total value.
- Inventory table with serialized item, branch, status, price, and purchase date.
- Add inventory item dialog.
- Movement dialog for in/out/transfer/adjustment/installed/returned.
- Install and return actions.
- Recent movement table.

### Topology

- Nearest ODP search by latitude/longitude.
- Shows distance and available capacity.
- ODP capacity table.

### Technical

- Data: routers, OLTs, ACS, passive devices, poles, antennas, tunnels,
  inventory, movements.
- Topology helper with haversine distance and nearest ODP.
- Zustand network store with audit logging.
- Hooks: `useNetworkOverview`, `useRouterDialog`, `useOltDialog`,
  `useCredentialRotation`, `usePassiveDevicesPage`, `useInventoryPage`,
  `useTopology`.
- Components: `NetworkOverviewPage`, `DeviceTables`, `DeviceDialogs`,
  `CredentialsRotateDialog`, `PassiveDevicesPage`, `PassiveDevicesTable`,
  `PassiveDeviceDialog`, `InventoryPage`, `InventoryTable`,
  `InventoryDialogs`, `TopologyPage`.
- shadcn Select, DataTable, ActionIconButton + tooltip.

## User revisions applied

- PascalCase component files and camelCase hooks.
- Logic separated into hooks.
- shadcn Select for all dropdowns.
- Reusable DataTable for routers, OLTs, passive devices, inventory, and
  movements.
- Icon-only table actions with tooltips and `aria-label`.
- Lint-only verification.

## Known limitations

- Router/OLT test and credential rotation are simulated.
- ACS sync is simulated.
- Topology is a coordinate-based nearest ODP lookup, not an interactive map.
- Inventory movement rules are simplified.
- No integration adapter or secret store is connected.

## Phase 1 ERD alignment

- Router, OLT, pole, passive device, antenna, tunnel, inventory item, and
  inventory movement now use branch/router/OLT/pole/passive-device IDs instead
  of display names.
- `PassiveDevice` supports `parentDeviceId`, `oltId`, and `poleId`.
- `InventoryMovement` supports `fromBranchId`, `toBranchId`, and `employeeId`.
- Added CRUD for poles, antennas, and tunnels.
- Passive device dialog selects parent device, OLT, and pole from master data.
- Inventory dialogs select branch and employee from master data.
- Tables resolve display names through branch and network stores.
- Persisted network store key bumped to `muranet-network-v2` because the entity
  shape changed.

## Dedicated router CRUD

- Added `/dashboard/jaringan/router` and `/dashboard/jaringan/router/[id]`.
- Router fields: lokasi/cabang, nama, IP address, port API, user, password
  (write-only secret reference), dan status.
- Added `removeRouter` with guard: router yang masih dipakai service tidak bisa
  dihapus.
- Added `rotateRouterSecret` for password rotation without storing plaintext.
- Router list menampilkan jumlah pelanggan aktif yang dihitung dari relasi
  `services.routerId` → `subscriptions.customerId`.
- Router detail menampilkan service dan pelanggan yang terhubung, termasuk ODP
  dan OLT.
- Sidebar Jaringan menambahkan menu Router.

## Router dashboard

- `/dashboard/jaringan/router/[id]` sekarang menjadi dashboard router.
- General information: lokasi, IP, port API, user, status password, status
  router, last seen, last test, model, RouterOS, architecture, serial, uptime.
- Realtime traffic disimulasikan setiap 3 detik dengan RX/TX current, average,
  peak, grafik SVG 24 sampel, indikator live, dan pause/resume.
- Health metrics: CPU, memory, disk, temperature, latency, packet loss, active
  sessions, uptime.
- Jumlah pelanggan aktif tetap dihitung dari relasi service + subscription.
- Tabel service/pelanggan terhubung dipertahankan di dashboard.
- Aksi dashboard: edit, test koneksi, dan rotasi password.
- Telemetry realtime tidak dipersist ke localStorage.
