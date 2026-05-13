type CallbackContext = {
  returnTo?: string;
  responseType?: string;
  challengeMode?: string;
};

type AuthSessionLike = {
  user: {
    sub?: string;
    name?: string;
    email?: string;
  };
  tokenSet: {
    accessToken: string;
    audience?: string;
    scope?: string;
    expiresAt: number;
  };
};

export function maskToken(token: string) {
  // Keep enough token shape for debugging without logging the full secret.
  if (token.length <= 16) {
    return token;
  }

  return `${token.slice(0, 8)}…${token.slice(-6)}`;
}

export function buildLoginSuccessLog(session: AuthSessionLike, idToken: string | null) {
  return {
    user: {
      sub: session.user.sub,
      name: session.user.name,
      email: session.user.email,
    },
    tokenSet: {
      audience: session.tokenSet.audience,
      scope: session.tokenSet.scope,
      expiresAt: session.tokenSet.expiresAt,
      accessTokenPreview: maskToken(session.tokenSet.accessToken),
      idTokenPreview: idToken ? maskToken(idToken) : null,
    },
  };
}

export function buildCallbackFailureLog(
  error: { code: string; message: string },
  ctx: CallbackContext,
) {
  return {
    code: error.code,
    message: error.message,
    returnTo: ctx.returnTo,
    responseType: ctx.responseType,
    challengeMode: ctx.challengeMode,
  };
}
