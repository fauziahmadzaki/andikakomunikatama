export type DeviceStatus = "active" | "inactive" | "maintenance" | "retired";
export type InventoryStatus =
  | "in_stock"
  | "installed"
  | "returned"
  | "damaged"
  | "retired";
export type MovementType =
  | "in"
  | "out"
  | "transfer"
  | "adjustment"
  | "installed"
  | "returned";

export type Router = {
  id: string;
  name: string;
  branchId: string;
  host: string;
  apiPort: number;
  username: string;
  secretRef?: string;
  secretConfigured: boolean;
  status: DeviceStatus;
  lastSeenAt?: string;
  lastTestResult?: "success" | "failed";
  lastTestMessage?: string;
};

export type RouterQueue = {
  id: string;
  routerId: string;
  name: string;
  kind: "parent" | "simple";
  target?: string;
  comment?: string;
  maxLimit?: string;
};

export type RouterPppoeSecret = {
  id: string;
  routerId: string;
  username: string;
  profile: string;
  comment?: string;
  isActive: boolean;
};

export type RouterHotspotUser = {
  id: string;
  routerId: string;
  username: string;
  profile: string;
  comment?: string;
  isActive: boolean;
};

export type Olt = {
  id: string;
  name: string;
  branchId: string;
  vendor: string;
  model: string;
  host: string;
  telnetPort: number;
  snmpPort: number;
  snmpVersion: string;
  secretConfigured: boolean;
  status: DeviceStatus;
  lastTestResult?: "success" | "failed";
};

export type AcsServer = {
  id: string;
  name: string;
  baseUrl: string;
  username: string;
  secretConfigured: boolean;
  lastSyncAt?: string;
  status: "healthy" | "degraded" | "offline";
};

export type PassiveDeviceType =
  | "odp"
  | "odc"
  | "splitter"
  | "switch"
  | "otb"
  | "joint_closure";

export type PassiveDevice = {
  id: string;
  code: string;
  name: string;
  type: PassiveDeviceType;
  branchId: string;
  parentDeviceId?: string;
  oltId?: string;
  poleId?: string;
  capacity: number;
  usedCapacity: number;
  usedPorts?: number[];
  latitude: number;
  longitude: number;
};

export type Pole = {
  id: string;
  code: string;
  name: string;
  branchId: string;
  latitude: number;
  longitude: number;
  address: string;
};

export type Antenna = {
  id: string;
  name: string;
  branchId: string;
  routerId: string;
  mac: string;
  ip: string;
  ssid: string;
  frequency: string;
  channel: string;
};

export type Tunnel = {
  id: string;
  name: string;
  routerId: string;
  username: string;
  isActive: boolean;
};

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  serialNumber: string;
  mac?: string;
  branchId: string;
  status: InventoryStatus;
  purchasePrice: number;
  currentValue?: number;
  purchasedAt: string;
  notes?: string;
};

export type InventoryMovement = {
  id: string;
  inventoryItemId: string;
  type: MovementType;
  reference: string;
  fromBranchId?: string;
  toBranchId?: string;
  employeeId?: string;
  actor?: string;
  occurredAt: string;
  notes: string;
};
