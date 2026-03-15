import { cookies } from "next/headers";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string[];
  secondMeUserId: string;
  displayName: string;
  avatar?: string | null;
};

export const AUTH_SESSION_COOKIE = "agentstory_session";
export const AUTH_STATE_COOKIE = "agentstory_oauth_state";

function encodeSession(session: AuthSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decodeSession(value: string) {
  const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as AuthSession;
  return parsed;
}

export async function getAuthSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  try {
    return decodeSession(raw);
  } catch {
    return null;
  }
}

export function serializeAuthSession(session: AuthSession) {
  return encodeSession(session);
}

export function isAuthSessionExpired(session: AuthSession) {
  return Date.now() >= session.expiresAt;
}
