import type { UserRole } from "@/features/users/data/users";

export type Session = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  branchId: string;
  branchName: string;
  token?: string;
};
