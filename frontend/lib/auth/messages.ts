export function getAuthErrorMessage(code?: string) {
  if (!code) {
    return null;
  }

  if (code === "access_denied") {
    return "Login was cancelled. Please try again.";
  }

  return `Login failed (${code}). Please try again.`;
}
