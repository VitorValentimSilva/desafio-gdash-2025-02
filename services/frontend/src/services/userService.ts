import api from "@/services/api";
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
    const { data } = await api.get<UserResponse | null>(`/users/${id}`);
    return data;
  },

  async create(dto: CreateUserDto): Promise<UserResponse> {
    const { data } = await api.post<UserResponse>("/users", dto);
    return data;
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
    const { data } = await api.get(`/users/${id}/export`);
    return data;
  },
};
