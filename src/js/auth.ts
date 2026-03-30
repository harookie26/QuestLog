const AUTH_KEY = "questlog-auth";
const USER_KEY = "questlog-user";
const AUTH_EVENT = "questlog-auth-updated";

const hasWindow = () => typeof window !== "undefined";

const notifyAuthUpdate = (): void => {
  if (!hasWindow()) return;
  window.dispatchEvent(new Event(AUTH_EVENT));
};

const getStoragePair = (): {
  active: Storage | null;
  fallback: Storage | null;
} => {
  if (!hasWindow()) return { active: null, fallback: null };

  const localAuth = localStorage.getItem(AUTH_KEY) === "true";
  const sessionAuth = sessionStorage.getItem(AUTH_KEY) === "true";

  if (localAuth) return { active: localStorage, fallback: sessionStorage };
  if (sessionAuth) return { active: sessionStorage, fallback: localStorage };

  if (localStorage.getItem(USER_KEY))
    return { active: localStorage, fallback: sessionStorage };
  if (sessionStorage.getItem(USER_KEY))
    return { active: sessionStorage, fallback: localStorage };

  return { active: null, fallback: null };
};

export const isAuthenticated = (): boolean => {
  if (!hasWindow()) return false;
  return (
    localStorage.getItem(AUTH_KEY) === "true" ||
    sessionStorage.getItem(AUTH_KEY) === "true"
  );
};

export const getStoredUser = <T = unknown>(): T | null => {
  const { active } = getStoragePair();
  if (!active) return null;

  const raw = active.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const saveAuth = (user: unknown, keepSignedIn: boolean): void => {
  if (!hasWindow()) return;

  const target = keepSignedIn ? localStorage : sessionStorage;
  const other = keepSignedIn ? sessionStorage : localStorage;

  other.removeItem(AUTH_KEY);
  other.removeItem(USER_KEY);

  target.setItem(AUTH_KEY, "true");
  target.setItem(USER_KEY, JSON.stringify(user));
  notifyAuthUpdate();
};

export const clearAuth = (): void => {
  if (!hasWindow()) return;

  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(USER_KEY);
  notifyAuthUpdate();
};

export const AUTH_UPDATED_EVENT = AUTH_EVENT;

export const fetchSessionUser = async <T = unknown>(): Promise<T | null> => {
  try {
    const res = await fetch("/api/users/me", {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      clearAuth();
      return null;
    }

    const user = (await res.json()) as T;

    const { active } = getStoragePair();
    const keepSignedIn = active === localStorage;
    saveAuth(user, keepSignedIn);

    return user;
  } catch {
    clearAuth();
    return null;
  }
};

export const logoutFromServer = async (): Promise<void> => {
  try {
    await fetch("/api/users/logout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Ignore network errors and still clear local cache.
  } finally {
    clearAuth();
  }
};
