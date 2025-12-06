import api, { axios } from "@/services/api";
import { setToken, clearToken } from "@/lib/tokenStorage";
import type { LoginDto, TokenResponse } from "@/types/auth";
import { extractTokenFromResponse, mapUserFromResponse } from "@/lib/userFunction";

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

      const user = mapUserFromResponse(data.user ?? data);

      const normalized: TokenResponse = {
        accessToken: token ?? "",
        expiresIn: (data?.expiresIn as number) ?? (data?.expires_in as number),
        tokenType: (data?.tokenType as string) ?? (data?.token_type as string),
        user,
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
