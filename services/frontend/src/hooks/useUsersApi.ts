import { useCallback } from "react";
import type {
  CreateUserDto,
  PaginatedResult,
  UpdateUserDto,
  UserResponse,
} from "@/types/user";
import { userService } from "@/services/userService";
import type { TokenResponse } from "@/types/auth";

export function useUsersApi() {
  const list = useCallback(
    (page = 1, limit = 20): Promise<PaginatedResult<UserResponse>> => {
      return userService.list(page, limit);
    },
    []
  );

  const get = useCallback((id: string): Promise<UserResponse | null> => {
    return userService.get(id);
  }, []);

  const create = useCallback((dto: CreateUserDto): Promise<TokenResponse> => {
    return userService.create(dto);
  }, []);

  const update = useCallback(
    (id: string, dto: UpdateUserDto): Promise<UserResponse> => {
      return userService.update(id, dto);
    },
    []
  );

  const remove = useCallback((id: string): Promise<UserResponse> => {
    return userService.remove(id);
  }, []);

  const exportUser = useCallback((id: string) => {
    return userService.exportUser(id);
  }, []);

  return {
    list,
    get,
    create,
    update,
    remove,
    exportUser,
  } as const;
}
