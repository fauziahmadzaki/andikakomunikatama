export type MigrationStepStatus = "pending" | "running" | "completed" | "failed";

export type MigrationStep = {
  id: string;
  title: string;
  description: string;
  status: MigrationStepStatus;
  count?: number;
};
