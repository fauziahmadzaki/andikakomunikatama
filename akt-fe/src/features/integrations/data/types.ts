export type IntegrationStatus = "healthy" | "degraded" | "offline";

export type IntegrationAdapter = {
  id: string;
  name: string;
  type: string;
  endpoint: string;
  status: IntegrationStatus;
  lastCheckAt?: string;
  secretConfigured: boolean;
};

export type IntegrationLog = {
  id: string;
  adapter: string;
  action: string;
  status: "success" | "failed";
  message: string;
  createdAt: string;
};
