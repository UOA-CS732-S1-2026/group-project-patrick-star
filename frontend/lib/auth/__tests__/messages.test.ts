import { describe, expect, it } from "vitest";
import { getAuthErrorMessage } from "../messages";

describe("getAuthErrorMessage", () => {
  it("returns null when there is no error code", () => {
    expect(getAuthErrorMessage()).toBeNull();
  });

  it("returns a friendly message when the user cancels login", () => {
    expect(getAuthErrorMessage("access_denied")).toBe(
      "Login was cancelled. Please try again.",
    );
  });

  it("returns a generic message for other error codes", () => {
    expect(getAuthErrorMessage("server_error")).toBe(
      "Login failed (server_error). Please try again.",
    );
  });
});
