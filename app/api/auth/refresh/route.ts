import { NextResponse } from "next/server";
import {
  AUTH_SESSION_COOKIE,
  buildAuthCookieOptions,
  buildExpiredAuthCookieOptions,
  readAuthSessionFromCookieHeader,
  refreshAuthSession,
  serializeAuthSession
} from "@/lib/auth";
import { refreshSecondMeToken } from "@/lib/secondme";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const session = readAuthSessionFromCookieHeader(request.headers.get("cookie"));

  if (!session?.refreshToken) {
    return NextResponse.redirect(new URL("/me?auth=expired", url));
  }

  try {
    const tokenData = await refreshSecondMeToken(session.refreshToken);
    const response = NextResponse.redirect(new URL("/me?auth=refreshed", url));

    response.cookies.set(
      AUTH_SESSION_COOKIE,
      serializeAuthSession(refreshAuthSession(session, tokenData)),
      buildAuthCookieOptions(url.toString())
    );

    return response;
  } catch {
    const response = NextResponse.redirect(new URL("/me?auth=expired", url));
    response.cookies.set(AUTH_SESSION_COOKIE, "", buildExpiredAuthCookieOptions(url.toString()));
    return response;
  }
}
