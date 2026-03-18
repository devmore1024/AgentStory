import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_SESSION_COOKIE,
  buildAuthCookieOptions,
  buildExpiredAuthCookieOptions,
  isAuthAccessTokenExpired,
  isAuthSessionExpired,
  readAuthSessionFromCookieHeader,
  refreshAuthSession,
  serializeAuthSession,
  shouldRefreshAuthSession
} from "@/lib/auth-session";
import { refreshSecondMeToken } from "@/lib/secondme";

function updateCookieHeader(rawCookie: string | null, cookieName: string, value: string | null) {
  const cookieParts = (rawCookie ?? "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !item.startsWith(`${cookieName}=`));

  if (value) {
    cookieParts.push(`${cookieName}=${value}`);
  }

  return cookieParts.join("; ");
}

function buildRequestHeaders(request: NextRequest, sessionCookieValue: string | null) {
  const headers = new Headers(request.headers);
  const nextCookieHeader = updateCookieHeader(headers.get("cookie"), AUTH_SESSION_COOKIE, sessionCookieValue);

  if (nextCookieHeader) {
    headers.set("cookie", nextCookieHeader);
  } else {
    headers.delete("cookie");
  }

  return headers;
}

export async function middleware(request: NextRequest) {
  const session = readAuthSessionFromCookieHeader(request.headers.get("cookie"));

  if (!session?.refreshToken || !shouldRefreshAuthSession(session)) {
    return NextResponse.next();
  }

  try {
    const refreshedSession = refreshAuthSession(session, await refreshSecondMeToken(session.refreshToken));
    const serializedSession = serializeAuthSession(refreshedSession);
    const response = NextResponse.next({
      request: {
        headers: buildRequestHeaders(request, serializedSession)
      }
    });

    response.cookies.set(AUTH_SESSION_COOKIE, serializedSession, buildAuthCookieOptions(request.url));

    return response;
  } catch (error) {
    if (!isAuthAccessTokenExpired(session) || !isAuthSessionExpired(session)) {
      console.warn(
        `[Auth] Token refresh failed, but the session is still within grace. user=${session.secondMeUserId}`,
        error
      );
      return NextResponse.next();
    }

    console.error(`[Auth] Token refresh failed and exceeded grace. user=${session.secondMeUserId}`, error);

    const response = NextResponse.next({
      request: {
        headers: buildRequestHeaders(request, null)
      }
    });

    response.cookies.set(AUTH_SESSION_COOKIE, "", buildExpiredAuthCookieOptions(request.url));

    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"]
};
