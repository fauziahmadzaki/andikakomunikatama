import { apiClient } from "@/lib/api-client";
import type { LoginValues } from "../data/login-schema";
import type { Session } from "../data/session";

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: Omit<Session, "token">;
    token: string;
  };
}

export const loginApi = async (credentials: LoginValues): Promise<LoginResponse["data"]> => {
  const response = await apiClient.post<LoginResponse>("/auth/login", credentials);
  return response.data.data;
};

export const getMeApi = async (): Promise<Omit<Session, "token">> => {
  const response = await apiClient.get<{ success: boolean; data: Omit<Session, "token"> }>("/auth/me");
  return response.data.data;
};
