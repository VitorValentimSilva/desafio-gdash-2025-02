import { setToken } from "@/lib/tokenStorage";
import {
  extractTokenFromResponse,
  mapUserFromResponse,
} from "@/lib/userFunction";
import api, { axios } from "@/services/api";
import type { TokenResponse } from "@/types/auth";
import type {
  CreateUserDto,
  PaginatedResult,
  UpdateUserDto,
  UserResponse,
} from "@/types/user";

export const userService = {
  async list(page = 1, limit = 20): Promise<PaginatedResult<UserResponse>> {
    const { data } = await api.get<PaginatedResult<UserResponse>>("/users", {
      params: { page, limit },
    });
    return data;
  },

  async get(id: string): Promise<UserResponse | null> {
    try {
      const resp = await api.get<UserResponse | null>(`/users/${id}`);

      return resp.data;
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

  async create(dto: CreateUserDto): Promise<TokenResponse> {
    try {
      const resp = await api.post("/users", dto);
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

  async update(id: string, dto: UpdateUserDto): Promise<UserResponse> {
    const { data } = await api.patch<UserResponse>(`/users/${id}`, dto);
    return data;
  },

  async remove(id: string): Promise<UserResponse> {
    const { data } = await api.delete<UserResponse>(`/users/${id}`);
    return data;
  },

  async exportUser(id: string) {
    const resp = await api.get(`/users/${id}/export`, { responseType: "blob" });
    return resp;
  },
};
