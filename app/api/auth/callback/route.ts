import { NextResponse } from "next/server";
import { AUTH_SESSION_COOKIE, AUTH_STATE_COOKIE, serializeAuthSession } from "@/lib/auth";
import { upsertAuthenticatedViewer } from "@/lib/current-user";
import { mapSecondMeProfileToPersona } from "@/lib/persona-mapper";
import {
  exchangeSecondMeCode,
  fetchSecondMeShades,
  fetchSecondMeSoftMemory,
  fetchSecondMeUserInfo
} from "@/lib/secondme";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const cookieStore = request.headers.get("cookie") ?? "";
  const stateMatch = cookieStore
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${AUTH_STATE_COOKIE}=`));
  const storedState = stateMatch ? decodeURIComponent(stateMatch.split("=")[1] ?? "") : null;

  if (error) {
    return NextResponse.redirect(new URL("/me?auth=denied", url));
  }

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/me?auth=invalid_state", url));
  }

  try {
    const tokenData = await exchangeSecondMeCode(code);
    const [userInfo, shades, softMemory] = await Promise.all([
      fetchSecondMeUserInfo(tokenData.accessToken),
      fetchSecondMeShades(tokenData.accessToken),
      fetchSecondMeSoftMemory(tokenData.accessToken)
    ]);

    const mapped = mapSecondMeProfileToPersona({
      userInfo,
      shades,
      softMemory
    });

    await upsertAuthenticatedViewer({
      secondMeUserId: userInfo.userId,
      displayName: userInfo.name,
      avatar: userInfo.avatar ?? null,
      persona: mapped.persona,
      mappingVersion: mapped.mappingVersion,
      mappingReason: mapped.mappingReason,
      confidenceScore: mapped.confidenceScore,
      rawSecondMeProfile: mapped.rawSecondMeProfile
    });

    const response = NextResponse.redirect(new URL("/me?auth=connected", url));

    response.cookies.set(
      AUTH_SESSION_COOKIE,
      serializeAuthSession({
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt: Date.now() + tokenData.expiresIn * 1000,
        scope: tokenData.scope ?? [],
        secondMeUserId: userInfo.userId,
        displayName: userInfo.name,
        avatar: userInfo.avatar ?? null
      }),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: tokenData.expiresIn
      }
    );

    response.cookies.set(AUTH_STATE_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0
    });

    return response;
  } catch {
    return NextResponse.redirect(new URL("/me?auth=failed", url));
  }
}
