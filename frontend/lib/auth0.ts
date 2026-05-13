import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";
import { buildCallbackRedirectUrl } from "@/lib/auth/callback";
import {
  buildCallbackFailureLog,
  buildLoginSuccessLog,
} from "@/lib/auth/logging";

const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

// Central Auth0 client configuration for login, callback handling, and backend profile sync.
export const auth0 = new Auth0Client({
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
    scope: process.env.AUTH0_SCOPE ?? "openid profile email",
  },
  beforeSessionSaved: async (session, idToken) => {
    console.log("[auth] login succeeded", buildLoginSuccessLog(session, idToken));

    // Ensure the MongoDB profile exists as soon as Auth0 creates the session.
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.tokenSet.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: session.user.name,
        email: session.user.email,
      }),
    });

    return session;
  },
  onCallback: async (error, ctx) => {
    // Route failed callbacks back to login with an error code the page can translate.
    if (error) {
      console.warn("[auth] callback failed", buildCallbackFailureLog(error, ctx));
      return NextResponse.redirect(buildCallbackRedirectUrl(error, ctx, appBaseUrl));
    }

    return NextResponse.redirect(buildCallbackRedirectUrl(null, ctx, appBaseUrl));
  },
});
