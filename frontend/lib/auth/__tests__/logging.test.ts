import { describe, expect, it } from "vitest";
import {
  buildCallbackFailureLog,
  buildLoginSuccessLog,
  maskToken,
} from "../logging";

describe("maskToken", () => {
  it("returns short tokens unchanged", () => {
    expect(maskToken("short-token")).toBe("short-token");
  });

  it("masks long tokens", () => {
    expect(maskToken("abcdefghijklmnopqrstuvwxyz")).toBe("abcdefgh…uvwxyz");
  });
});

describe("buildLoginSuccessLog", () => {
  it("creates a safe log payload from mock session data", () => {
    const logPayload = buildLoginSuccessLog(
      {
        user: {
          sub: "auth0|123",
          name: "Eason",
          email: "eason@gmail.com",
        },
        tokenSet: {
          accessToken: "abcdefghijklmnopqrstuvwxyz",
          audience: "https://wardrobe-api/",
          scope: "openid profile email",
          expiresAt: 1_750_000_000,
        },
      },
      "1234567890abcdef1234567890abcdef",
    );

    expect(logPayload).toEqual({
      user: {
        sub: "auth0|123",
        name: "Eason",
        email: "eason@gmail.com",
      },
      tokenSet: {
        audience: "https://wardrobe-api/",
        scope: "openid profile email",
        expiresAt: 1_750_000_000,
        accessTokenPreview: "abcdefgh…uvwxyz",
        idTokenPreview: "12345678…abcdef",
      },
    });
  });
});

describe("buildCallbackFailureLog", () => {
  it("captures callback metadata for debugging", () => {
    expect(
      buildCallbackFailureLog(
        {
          code: "access_denied",
          message: "The user denied the request",
        },
        {
          returnTo: "/dashboard",
          responseType: "code",
          challengeMode: "redirect",
        },
      ),
    ).toEqual({
      code: "access_denied",
      message: "The user denied the request",
      returnTo: "/dashboard",
      responseType: "code",
      challengeMode: "redirect",
    });
  });
});
