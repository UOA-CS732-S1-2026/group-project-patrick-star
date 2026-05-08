"use client";

type AuthConfig = {
  domain: string;
  clientID: string;
  audience: string;
  scope: string;
  connection: string;
};

export type AuthResult = {
  accessToken?: string;
  idToken?: string;
  expiresIn?: number;
  scope?: string;
  state?: string;
  idTokenPayload?: {
    sub?: string;
    name?: string;
    email?: string;
    picture?: string;
    nickname?: string;
  };
  [key: string]: unknown;
};

export type Auth0LikeError = Error & {
  code?: string;
  error?: string;
  errorDescription?: string;
  error_description?: string;
  statusCode?: number;
  description?: string;
  details?: unknown;
};

let authConfig: AuthConfig | null = null;

function requireEnv(name: string, fallback?: string) {
  if (!fallback) {
    throw new Error(`Missing ${name} in the frontend environment`);
  }
  return fallback;
}

export function getAuthConfig(): AuthConfig {
  if (!authConfig) {
    authConfig = {
      domain: requireEnv(
        "NEXT_PUBLIC_AUTH0_DOMAIN",
        process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
      ),
      clientID: requireEnv(
        "NEXT_PUBLIC_AUTH0_CLIENT_ID",
        process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
      ),
      audience: requireEnv(
        "NEXT_PUBLIC_AUTH0_AUDIENCE",
        process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
      ),
      scope: process.env.NEXT_PUBLIC_AUTH0_SCOPE ?? "openid profile email",
      connection:
        process.env.NEXT_PUBLIC_AUTH0_CONNECTION ??
        "Username-Password-Authentication",
    };
  }

  return authConfig;
}

export function normalizeAuthError(error: unknown): Auth0LikeError {
  if (error instanceof Error) {
    return error as Auth0LikeError;
  }

  if (typeof error === "object" && error !== null) {
    const details = error as Record<string, unknown>;
    const message =
      (typeof details.error_description === "string" &&
        details.error_description) ||
      (typeof details.errorDescription === "string" &&
        details.errorDescription) ||
      (typeof details.description === "string" && details.description) ||
      (typeof details.message === "string" && details.message) ||
      "Authentication failed";

    const normalized = new Error(message) as Auth0LikeError;
    if (typeof details.code === "string") {
      normalized.code = details.code;
    }
    if (typeof details.error === "string") {
      normalized.error = details.error;
    }
    if (typeof details.error_description === "string") {
      normalized.error_description = details.error_description;
    }
    if (typeof details.errorDescription === "string") {
      normalized.errorDescription = details.errorDescription;
    }
    if (typeof details.statusCode === "number") {
      normalized.statusCode = details.statusCode;
    }
    if (typeof details.description === "string") {
      normalized.description = details.description;
    }
    normalized.details = error;
    return normalized;
  }

  return new Error(String(error)) as Auth0LikeError;
}
