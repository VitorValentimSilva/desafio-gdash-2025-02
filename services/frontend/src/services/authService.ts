import api, { axios } from "@/services/api";
import { setToken, clearToken } from "@/lib/tokenStorage";
import type { LoginDto, TokenResponse } from "@/types/auth";

function extractTokenFromResponse(data: unknown): string | undefined {
  const response = data as Record<string, unknown>;
  return (
    (response?.accessToken as string | undefined) ??
    (response?.access_token as string | undefined) ??
    (response?.token as string | undefined) ??
    ((response?.access as Record<string, unknown>)?.token as string | undefined)
  );
}

export const authService = {
  async login(payload: LoginDto): Promise<TokenResponse> {
    try {
      const resp = await api.post("/auth/login", payload);
      const data = resp.data;

      const token = extractTokenFromResponse(data);
      if (token) {
        setToken(token);
      } else {
        console.warn(
          "[authService] no token found in response (checked accessToken/access_token/token)"
        );
      }

      const normalized: TokenResponse = {
        accessToken: token ?? "",
        expiresIn: data?.expiresIn ?? data?.expires_in,
        tokenType: data?.tokenType ?? data?.token_type,
      };

      return normalized;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const respData = err.response?.data;
        let message = err.message;
        if (respData) {
          if (typeof respData.message === "string") message = respData.message;
          else if (Array.isArray(respData.message))
            message = respData.message.join(" ");
          else if (respData.error) message = respData.error;
        }
        throw new Error(message);
      }
      throw err;
    }
  },

  logout() {
    clearToken();
  },
};
