import { NextResponse } from "next/server";
import { AUTH_STATE_COOKIE, buildAuthCookieOptions } from "@/lib/auth";
import { buildSecondMeAuthorizeUrl } from "@/lib/secondme";

export async function GET(request: Request) {
  const state = crypto.randomUUID();
  const requestUrl = new URL(request.url);
  const response = NextResponse.redirect(buildSecondMeAuthorizeUrl(state, requestUrl.origin));

  response.cookies.set(AUTH_STATE_COOKIE, state, {
    ...buildAuthCookieOptions(requestUrl.toString(), 60 * 10)
  });

  return response;
}
