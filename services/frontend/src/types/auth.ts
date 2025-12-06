import type { UserResponse } from "./user";

export interface LoginDto {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  expiresIn?: number;
  tokenType?: string;
  user?: UserResponse;
}
