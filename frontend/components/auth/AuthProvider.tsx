"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  loginWithPassword,
  normalizeAuthError,
  signupUser,
} from "@/lib/auth/browser";
import {
  buildAuthSession,
  readStoredAuthSession,
  type AuthSession,
  writeStoredAuthSession,
} from "@/lib/auth/session";
import { syncAuthenticatedUser } from "@/lib/auth/sync";

type LoginValues = {
  email: string;
  password: string;
};

type SignUpValues = LoginValues & {
  name: string;
};

type AuthContextValue = {
  session: AuthSession | null;
  login: (values: LoginValues) => Promise<AuthSession>;
  signup: (values: SignUpValues) => Promise<AuthSession>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const listeners = new Set<() => void>();
let currentSession: AuthSession | null = readStoredAuthSession();

function emitAuthUpdate() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return currentSession;
}

function getServerSnapshot() {
  return null;
}

function updateSession(session: AuthSession | null) {
  currentSession = session;
  writeStoredAuthSession(session);
  emitAuthUpdate();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      login: async (values) => {
        const authResult = await loginWithPassword(
          values.email,
          values.password,
        );
        const nextSession = buildAuthSession(authResult, {
          email: values.email,
          preferredName:
            authResult.idTokenPayload?.name ??
            authResult.idTokenPayload?.nickname ??
            values.email.split("@")[0],
        });

        await syncAuthenticatedUser(nextSession, {
          name: nextSession.user.name,
          email: nextSession.user.email,
        });

        updateSession(nextSession);
        return nextSession;
      },
      signup: async (values) => {
        const signupResponse = await signupUser(values.email, values.password);
        console.log("[auth] signup succeeded", {
          email: values.email,
          signupResponse,
        });
        const authResult = await loginWithPassword(
          values.email,
          values.password,
        );
        const nextSession = buildAuthSession(authResult, {
          email: values.email,
          preferredName: values.name,
        });
        //auth0.com/docs/get-started/authentication-and-authorization-flow/resource-owner-password-flow

        https: await syncAuthenticatedUser(nextSession, {
          name: values.name,
          email: values.email,
        });

        updateSession(nextSession);
        return nextSession;
      },
      logout: () => {
        updateSession(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function getFriendlyAuthError(error: unknown, mode: "login" | "signup") {
  const authError = normalizeAuthError(error);
  const code = `${authError.code ?? authError.error ?? ""}`.toLowerCase();
  const message = `${authError.message ?? ""}`.toLowerCase();

  if (
    code.includes("user_exists") ||
    code.includes("already_exists") ||
    message.includes("user already exists") ||
    message.includes("already exists") ||
    message.includes("duplicate key")
  ) {
    return "That email is already registered. Try logging in instead.";
  }

  if (
    code.includes("invalid_user_password") ||
    code.includes("invalid_grant") ||
    code.includes("access_denied") ||
    code.includes("wrong email or password") ||
    message.includes("wrong email or password") ||
    message.includes("invalid username or password")
  ) {
    return "Email or password is incorrect.";
  }

  if (mode === "signup" && code.includes("invalid_email")) {
    return "Please use a valid email address.";
  }

  return authError.message || "Authentication failed.";
}
