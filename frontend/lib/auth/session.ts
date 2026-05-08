export type AuthUser = {
  sub: string;
  name: string;
  email: string;
  picture?: string | null;
};

export type AuthSession = {
  accessToken: string;
  idToken: string;
  expiresAt: number;
  user: AuthUser;
};

const STORAGE_KEY = "ai-wardrobe.auth-session";

function getDisplayName(email: string, preferredName?: string | null) {
  const preferred = preferredName?.trim();
  if (preferred && preferred.length >= 2) {
    return preferred.slice(0, 20);
  }

  const localPart = email.split("@")[0]?.trim();
  if (localPart && localPart.length >= 2) {
    return localPart.slice(0, 20);
  }

  return "New user";
}

export function buildAuthSession(
  authResult: {
    accessToken?: string;
    idToken?: string;
    expiresIn?: number;
    idTokenPayload?: {
      sub?: string;
      name?: string;
      email?: string;
      picture?: string;
      nickname?: string;
    };
  },
  fallback: { email: string; preferredName?: string | null }
): AuthSession {
  const payload = authResult.idTokenPayload ?? {};
  const email = payload.email ?? fallback.email;
  const name = getDisplayName(
    email,
    payload.name ?? payload.nickname ?? fallback.preferredName
  );

  if (!authResult.accessToken || !authResult.idToken) {
    throw new Error("Auth0 did not return the expected tokens.");
  }

  return {
    accessToken: authResult.accessToken,
    idToken: authResult.idToken,
    expiresAt: Date.now() + (authResult.expiresIn ?? 0) * 1000,
    user: {
      sub: payload.sub ?? "",
      name,
      email,
      picture: payload.picture ?? null,
    },
  };
}

export function readStoredAuthSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const session = JSON.parse(raw) as AuthSession;
    if (session.expiresAt && session.expiresAt <= Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function writeStoredAuthSession(session: AuthSession | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}
