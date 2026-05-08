import { describe, expect, it } from "vitest";
import { buildCallbackRedirectUrl } from "../callback";

describe("buildCallbackRedirectUrl", () => {
  it("returns the login page with an auth_error query when callback fails", () => {
    const url = buildCallbackRedirectUrl(
      {
        code: "access_denied",
      },
      {
        returnTo: "/outfits",
      },
      "http://localhost:3000",
    );

    expect(url.toString()).toBe(
      "http://localhost:3000/login?auth_error=access_denied",
    );
  });

  it("returns the requested returnTo path on success", () => {
    const url = buildCallbackRedirectUrl(null, { returnTo: "/outfits" }, "http://localhost:3000");

    expect(url.toString()).toBe("http://localhost:3000/outfits");
  });

  it("falls back to the home page when returnTo is missing", () => {
    const url = buildCallbackRedirectUrl(null, {}, "http://localhost:3000");

    expect(url.toString()).toBe("http://localhost:3000/");
  });
});
