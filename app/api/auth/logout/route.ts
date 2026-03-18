import { NextResponse } from "next/server";
import { AUTH_SESSION_COOKIE, AUTH_STATE_COOKIE, buildExpiredAuthCookieOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const response = NextResponse.redirect(new URL("/", url));

  response.cookies.set(AUTH_SESSION_COOKIE, "", buildExpiredAuthCookieOptions(url.toString()));

  response.cookies.set(AUTH_STATE_COOKIE, "", buildExpiredAuthCookieOptions(url.toString()));

  return response;
}
