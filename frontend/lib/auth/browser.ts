"use client";

import auth0 from "auth0-js";

type AuthConfig = {
  domain: string;
  clientID: string;
  audience: string;
  scope: string;
  connection: string;
};

type LoginCallback = (error: unknown, result?: AuthResult) => void;
interface Auth0AuthenticationClient {
  login(
    options: {
      username: string;
      password: string;
      realm: string;
      audience: string;
      scope: string;
    },
    callback: LoginCallback,
  ): void;
}

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
let authenticationClient: Auth0AuthenticationClient | null = null;

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
    console.log("authConfig", authConfig);
  }

  return authConfig;
}

function createAuthenticationClient() {
  const config = getAuthConfig();
  return new auth0.Authentication({
    domain: config.domain,
    clientID: config.clientID,
    audience: config.audience,
    scope: config.scope,
  }) as Auth0AuthenticationClient;
}

export function getAuthenticationClient() {
  if (!authenticationClient) {
    authenticationClient = createAuthenticationClient();
  }

  return authenticationClient;
}

export function loginWithPassword(email: string, password: string) {
  const config = getAuthConfig();

  return new Promise<AuthResult>((resolve, reject) => {
    getAuthenticationClient().login(
      {
        username: email,
        password,
        realm: config.connection,
        audience: config.audience,
        scope: config.scope,
      },
      (error, result) => {
        if (error) {
          reject(normalizeAuthError(error));
          return;
        }

        resolve(result as AuthResult);
      },
    );
  });
}

export function signupUser(email: string, password: string) {
  const config = getAuthConfig();

  return fetch(`https://${config.domain}/dbconnections/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: config.clientID,
      email,
      password,
      connection: config.connection,
    }),
  }).then(async (response) => {
    if (!response.ok) {
      let message = `Signup failed (${response.status})`;
      let rawBody = "";
      try {
        const payload = (await response.json()) as Record<string, unknown>;
        message =
          (typeof payload.error_description === "string" &&
            payload.error_description) ||
          (typeof payload.description === "string" && payload.description) ||
          (typeof payload.message === "string" && payload.message) ||
          message;
      } catch {
        rawBody = await response.text();
        if (rawBody) {
          message = rawBody;
        }
      }

      if (
        response.status === 400 &&
        !rawBody &&
        message === `Signup failed (${response.status})`
      ) {
        message = "That email is already registered. Try logging in instead.";
      }

      throw normalizeAuthError({ error_description: message });
    }

    return response.json() as Promise<Record<string, unknown>>;
  });
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
