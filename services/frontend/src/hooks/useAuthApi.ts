import { authService } from "@/services/authService";
import type { LoginDto, TokenResponse } from "@/types/auth";

export function useAuthApi() {
  const login = async (payload: LoginDto): Promise<TokenResponse> => {
    return authService.login(payload);
  };

  const logout = () => {
    authService.logout();
  };

  return { login, logout };
}
