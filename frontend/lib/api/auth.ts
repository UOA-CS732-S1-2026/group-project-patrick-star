export async function getAuthHeaders(
  includeJson = false,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  // Client components call this route so Auth0 tokens stay server-managed.
  const res = await fetch("/api/auth/token");

  if (res.ok) {
    const { token } = (await res.json()) as { token?: string | null };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}
