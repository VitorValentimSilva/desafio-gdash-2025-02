export type Role = "user" | "admin" | string;

export interface UserResponse {
  id: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  role?: Role;
}

export interface UpdateUserDto {
  email?: string;
  role?: Role;
  active?: boolean;
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: Meta;
}
