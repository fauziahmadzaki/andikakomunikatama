export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: unknown;
}

export type UserRole = 'admin' | 'teknisi' | 'cs';
