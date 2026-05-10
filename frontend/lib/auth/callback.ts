type CallbackErrorLike = {
  code: string;
};

type CallbackContextLike = {
  returnTo?: string;
};

export function buildCallbackRedirectUrl(
  error: CallbackErrorLike | null,
  ctx: CallbackContextLike,
  appBaseUrl: string,
) {
  if (error) {
    const loginUrl = new URL("/login", appBaseUrl);
    loginUrl.searchParams.set("auth_error", error.code);
    return loginUrl;
  }

  const returnTo = ctx.returnTo ?? "/onboarding";
  return new URL(returnTo, appBaseUrl);
}
