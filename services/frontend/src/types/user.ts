export type Role = "user" | "admin" | string;

export interface UserResponse {
  id: string;
  email: string;
  role: Role;
  active: boolean;
  name?: string;
  bio?: string;
  location?: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  role?: Role;
  name?: string;
  bio?: string;
  location?: string;
  photo?: string;
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
