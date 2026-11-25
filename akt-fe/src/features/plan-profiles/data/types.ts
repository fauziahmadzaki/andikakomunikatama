export type PlanProfileType = "pppoe" | "hotspot" | "other";
export type PlanProfileBillingType = "monthly" | "non_monthly";

export type RouterIpPool = {
  id: string;
  routerId: string;
  name: string;
  rangeStart: string;
  rangeEnd: string;
};

export type PlanProfile = {
  id: string;
  name: string;
  description: string;
  price: number;
  type: PlanProfileType;
  billingType: PlanProfileBillingType;
  isActive: boolean;
  routerId: string;
  ipPoolId: string;
  parentQueueId: string;
  parentQueueName: string;
  localAddress: string;
  downloadMbps: number;
  uploadMbps: number;
  oversubscription: boolean;
  oversubRatio: number;
  cirDownloadMbps: number;
  cirUploadMbps: number;
  mirDownloadMbps: number;
  mirUploadMbps: number;
  burstDownloadMbps: number;
  burstUploadMbps: number;
  rateLimit: string;
  createdAt: string;
};

export type SavePlanProfileInput = Omit<
  PlanProfile,
  "id" | "createdAt" | "ipPoolId"
> & {
  ipPoolId?: string;
  newPool?: Omit<RouterIpPool, "id">;
};

export type RouterSyncResult = {
  success: boolean;
  message: string;
};
