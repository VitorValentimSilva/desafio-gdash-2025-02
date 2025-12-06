import type { UserResponse } from "@/types/user";

export function extractTokenFromResponse(data: unknown): string | undefined {
  const response = data as Record<string, unknown>;
  return (
    (response?.accessToken as string | undefined) ??
    (response?.access_token as string | undefined) ??
    (response?.token as string | undefined) ??
    ((response?.access as Record<string, unknown>)?.token as string | undefined)
  );
}

export function mapUserFromResponse(raw: unknown): UserResponse | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const u = raw as Record<string, unknown>;
  const id = String(u.id ?? u._id ?? "");
  if (!id) return undefined;

  return {
    id,
    email: String(u.email ?? ""),
    role: (u.role as string) ?? "user",
    active: Boolean(u.active ?? true),
    name: typeof u.name === "string" ? u.name : undefined,
    bio: typeof u.bio === "string" ? u.bio : undefined,
    location: typeof u.location === "string" ? u.location : undefined,
    photo: typeof u.photo === "string" ? u.photo : undefined,
    createdAt: (u.createdAt ??
      u.created_at ??
      new Date().toISOString()) as string,
    updatedAt: (u.updatedAt ??
      u.updated_at ??
      new Date().toISOString()) as string,
  };
}
