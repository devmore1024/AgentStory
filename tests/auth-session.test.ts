import { describe, expect, it, vi } from "vitest";
import {
  AUTH_SESSION_COOKIE_MAX_AGE,
  AUTH_SESSION_FAILURE_GRACE_MS,
  AUTH_SESSION_REFRESH_WINDOW_MS,
  buildAuthCookieOptions,
  getAuthCookieDomain,
  isAuthAccessTokenExpired,
  isAuthSessionExpired,
  parseAuthSessionCookieValue,
  readAuthSessionFromCookieHeader,
  serializeAuthSession,
  shouldRefreshAuthSession,
  type AuthSession
} from "@/lib/auth-session";

function createSession(overrides: Partial<AuthSession> = {}): AuthSession {
  return {
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresAt: Date.now() + 30 * 60 * 1000,
    scope: ["chat"],
    secondMeUserId: "secondme-user-1",
    displayName: "Agent Story",
    avatar: null,
    ...overrides
  };
}

describe("auth session helpers", () => {
  it("round-trips the session cookie payload", () => {
    const session = createSession();
    const serialized = serializeAuthSession(session);

    expect(parseAuthSessionCookieValue(serialized)).toEqual(session);
    expect(readAuthSessionFromCookieHeader(`foo=bar; agentstory_session=${serialized}`)).toEqual(session);
  });

  it("starts refreshing within the five minute window", () => {
    const now = Date.now();
    const session = createSession({
      expiresAt: now + AUTH_SESSION_REFRESH_WINDOW_MS + 1
    });

    expect(shouldRefreshAuthSession(session, now)).toBe(false);
    expect(shouldRefreshAuthSession(session, now + 2)).toBe(true);
  });

  it("keeps the session alive for one hour after access token expiry", () => {
    const now = Date.now();
    const session = createSession({
      expiresAt: now - 5 * 60 * 1000
    });

    expect(isAuthAccessTokenExpired(session, now)).toBe(true);
    expect(isAuthSessionExpired(session, now)).toBe(false);
    expect(isAuthSessionExpired(session, now + AUTH_SESSION_FAILURE_GRACE_MS + 1)).toBe(true);
  });

  it("derives cookie domains for localhost, apex and www hosts", () => {
    vi.stubEnv("AUTH_COOKIE_DOMAIN", "");

    expect(getAuthCookieDomain("http://localhost:3000/me")).toBeUndefined();
    expect(getAuthCookieDomain("https://agentale.vercel.app/me")).toBe("agentale.vercel.app");
    expect(getAuthCookieDomain("https://www.agentstory.com/me")).toBe("agentstory.com");
  });

  it("allows overriding the cookie domain from env", () => {
    vi.stubEnv("AUTH_COOKIE_DOMAIN", "agentstory.com");

    expect(getAuthCookieDomain("https://preview.agentstory.com/me")).toBe("agentstory.com");
  });

  it("uses a long-lived auth cookie", () => {
    vi.stubEnv("AUTH_COOKIE_DOMAIN", "agentstory.com");

    expect(buildAuthCookieOptions("https://www.agentstory.com/me")).toEqual({
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: AUTH_SESSION_COOKIE_MAX_AGE,
      domain: "agentstory.com"
    });
  });
});
