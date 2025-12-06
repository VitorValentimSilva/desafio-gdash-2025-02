const USER_ID_KEY = "app_user_id";

export function setUserId(id: string) {
  localStorage.setItem(USER_ID_KEY, id);
}

export function getUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

export function clearUserId() {
  localStorage.removeItem(USER_ID_KEY);
}
