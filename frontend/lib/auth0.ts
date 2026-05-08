import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";
import { buildCallbackRedirectUrl } from "@/lib/auth/callback";
import {
  buildCallbackFailureLog,
  buildLoginSuccessLog,
} from "@/lib/auth/logging";

const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

export const auth0 = new Auth0Client({
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
    scope: process.env.AUTH0_SCOPE ?? "openid profile email",
  },
  beforeSessionSaved: async (session, idToken) => {
    console.log("[auth] login succeeded", buildLoginSuccessLog(session, idToken));

    return session;
  },
  onCallback: async (error, ctx) => {
    if (error) {
      console.warn("[auth] callback failed", buildCallbackFailureLog(error, ctx));
      return NextResponse.redirect(buildCallbackRedirectUrl(error, ctx, appBaseUrl));
    }

    return NextResponse.redirect(buildCallbackRedirectUrl(null, ctx, appBaseUrl));
  },
});
