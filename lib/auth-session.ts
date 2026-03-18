export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string[];
  secondMeUserId: string;
  displayName: string;
  avatar?: string | null;
};

type AuthTokenData = {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  scope?: string[];
};

type AuthCookieOptions = {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
  maxAge: number;
  domain?: string;
};

export const AUTH_SESSION_COOKIE = "agentstory_session";
export const AUTH_STATE_COOKIE = "agentstory_oauth_state";
export const AUTH_SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
export const AUTH_SESSION_REFRESH_WINDOW_MS = 5 * 60 * 1000;
export const AUTH_SESSION_FAILURE_GRACE_MS = 60 * 60 * 1000;

function readNonEmptyEnv(...values: Array<string | undefined>) {
  for (const value of values) {
    if (!value) {
      continue;
    }

    const trimmed = value.trim();

    if (trimmed.length > 0 && trimmed !== "undefined" && trimmed !== "null") {
      return trimmed;
    }
  }

  return null;
}

function encodeUtf8Base64Url(value: string) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64url");
  }

  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function decodeUtf8Base64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (normalized.length % 4)) % 4;
  const padded = normalized.padEnd(normalized.length + padding, "=");

  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }

  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.accessToken === "string" &&
    typeof candidate.refreshToken === "string" &&
    typeof candidate.expiresAt === "number" &&
    Array.isArray(candidate.scope) &&
    candidate.scope.every((scope) => typeof scope === "string") &&
    typeof candidate.secondMeUserId === "string" &&
    typeof candidate.displayName === "string" &&
    (candidate.avatar === undefined || candidate.avatar === null || typeof candidate.avatar === "string")
  );
}

function encodeSession(session: AuthSession) {
  return encodeUtf8Base64Url(JSON.stringify(session));
}

function decodeSession(value: string) {
  const parsed = JSON.parse(decodeUtf8Base64Url(value)) as unknown;

  if (!isAuthSession(parsed)) {
    throw new Error("Invalid auth session payload");
  }

  return parsed;
}

function readCookieValue(rawCookie: string | null, cookieName: string) {
  if (!rawCookie) {
    return null;
  }

  const cookiePart = rawCookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${cookieName}=`));

  if (!cookiePart) {
    return null;
  }

  return decodeURIComponent(cookiePart.slice(cookieName.length + 1));
}

function isIpHostname(hostname: string) {
  return /^[\d.]+$/u.test(hostname) || hostname.includes(":") || hostname === "[::1]";
}

export function parseAuthSessionCookieValue(value: string) {
  try {
    return decodeSession(value);
  } catch {
    return null;
  }
}

export function readAuthSessionFromCookieHeader(rawCookie: string | null) {
  const value = readCookieValue(rawCookie, AUTH_SESSION_COOKIE);

  if (!value) {
    return null;
  }

  return parseAuthSessionCookieValue(value);
}

export function serializeAuthSession(session: AuthSession) {
  return encodeSession(session);
}

export function shouldRefreshAuthSession(session: AuthSession, now = Date.now()) {
  return now >= session.expiresAt - AUTH_SESSION_REFRESH_WINDOW_MS;
}

export function isAuthAccessTokenExpired(session: AuthSession, now = Date.now()) {
  return now >= session.expiresAt;
}

export function isAuthSessionExpired(session: AuthSession, now = Date.now()) {
  return now >= session.expiresAt + AUTH_SESSION_FAILURE_GRACE_MS;
}

export function refreshAuthSession(session: AuthSession, tokenData: AuthTokenData, now = Date.now()): AuthSession {
  return {
    ...session,
    accessToken: tokenData.accessToken,
    refreshToken: tokenData.refreshToken ?? session.refreshToken,
    expiresAt: now + tokenData.expiresIn * 1000,
    scope: tokenData.scope ?? session.scope
  };
}

export function getAuthCookieDomain(requestUrl?: string) {
  const configuredDomain = readNonEmptyEnv(process.env.AUTH_COOKIE_DOMAIN);

  if (configuredDomain) {
    return configuredDomain;
  }

  if (!requestUrl) {
    return undefined;
  }

  const hostname = new URL(requestUrl).hostname;

  if (hostname === "localhost" || hostname.endsWith(".localhost") || isIpHostname(hostname)) {
    return undefined;
  }

  if (hostname.startsWith("www.")) {
    return hostname.slice(4);
  }

  return hostname;
}

export function buildAuthCookieOptions(requestUrl?: string, maxAge = AUTH_SESSION_COOKIE_MAX_AGE): AuthCookieOptions {
  const domain = getAuthCookieDomain(requestUrl);

  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
    ...(domain ? { domain } : {})
  };
}

export function buildExpiredAuthCookieOptions(requestUrl?: string) {
  return buildAuthCookieOptions(requestUrl, 0);
}
