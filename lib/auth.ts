import { cookies } from "next/headers";
import { AUTH_SESSION_COOKIE, parseAuthSessionCookieValue } from "@/lib/auth-session";

export * from "@/lib/auth-session";

export async function getAuthSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  return parseAuthSessionCookieValue(raw);
}
