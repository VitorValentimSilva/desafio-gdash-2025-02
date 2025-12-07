import { getToken } from "./tokenStorage";

export function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return decoded;
  } catch {
    return null;
  }
}

export function getUserRoleFromToken(): string | undefined {
  const token = getToken();
  const payload = parseJwt(token);
  if (!payload) return undefined;

  if (typeof payload.role === "string") return payload.role;
  if (payload.user && typeof payload.user.role === "string")
    return payload.user.role;
  return undefined;
}
