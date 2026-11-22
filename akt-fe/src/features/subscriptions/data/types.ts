export type SubscriptionStatus =
  | "draft"
  | "active"
  | "suspended"
  | "terminated";
export type ServiceStatus =
  | "pending"
  | "provisioned"
  | "active"
  | "suspended"
  | "terminated";
export type ServiceType = "pppoe" | "hotspot" | "static" | "dhcp" | "iptv";
export type CredentialType = "pppoe" | "hotspot" | "static" | "dhcp";
export type ConnectionType = "static" | "dhcp" | "pppoe" | "hotspot";
export type ProvisionMethod = "new" | "sync";
export type IncentiveMethod = "none" | "fixed" | "percentage";

export type ServiceInstallation = {
  snOnu?: string;
  onuSerial?: string;
  onuBrand?: string;
  odc?: string;
  odp?: string;
  odpPort?: string;
  cableLengthM?: number;
  connectorCount?: number;
  materialNotes?: string;
};

export type Subscription = {
  id: string;
  number: string;
  customerId: string;
  planId: string;
  branchId: string;
  discountId?: string;
  salesEmployeeId?: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  dueDay: number;
  prorateEnabled: boolean;
  taxEnabled: boolean;
  priceSnapshot: number;
  incentiveMethod?: IncentiveMethod;
  incentiveValue?: number;
  createdAt: string;
};

export type SubscriptionView = Subscription & {
  customerName: string;
  branchName: string;
  planName: string;
  monthlyFee: number;
  salesName: string;
  outstanding: number;
};

export type SubscriptionService = {
  id: string;
  subscriptionId: string;
  serviceType: ServiceType;
  username: string;
  routerId?: string;
  oltId?: string;
  passiveDeviceId?: string;
  planProfileId?: string;
  connectionType?: ConnectionType;
  provisionMethod?: ProvisionMethod;
  parentQueueId?: string;
  parentQueueName?: string;
  queueName?: string;
  targetIp?: string;
  syncSourceId?: string;
  installation?: ServiceInstallation;
  status: ServiceStatus;
  installedAt?: string;
  terminatedAt?: string;
};

export type ServiceView = SubscriptionService & {
  routerName: string;
  oltName: string;
  odpCode: string;
};

export type ServiceCredential = {
  id: string;
  serviceId: string;
  credentialType: CredentialType;
  username: string;
  secretRef: string;
  isActive: boolean;
};

export type SubscriptionHistory = {
  id: string;
  subscriptionId: string;
  status: SubscriptionStatus;
  reason: string;
  actor: string;
  createdAt: string;
};

export type SuspensionCandidate = {
  id: string;
  subscriptionId: string;
  customerName: string;
  planName: string;
  outstanding: number;
  dueDate: string;
  graceDays: number;
  selected: boolean;
  result?: "success" | "skipped" | "failed";
};

export type SubscriptionMigrationRow = {
  subscriptionId: string;
  customerName: string;
  currentPlan: string;
  currentPrice: number;
  targetPlan: string;
  targetPrice: number;
  status: SubscriptionStatus;
};
