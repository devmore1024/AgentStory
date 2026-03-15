import { NextResponse } from "next/server";
import { AUTH_SESSION_COOKIE, serializeAuthSession } from "@/lib/auth";
import { refreshSecondMeToken } from "@/lib/secondme";

function readSessionCookie(rawCookie: string | null) {
  if (!rawCookie) {
    return null;
  }

  const cookiePart = rawCookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${AUTH_SESSION_COOKIE}=`));

  if (!cookiePart) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(decodeURIComponent(cookiePart.split("=")[1] ?? ""), "base64url").toString("utf8")) as {
      refreshToken: string;
      scope: string[];
      secondMeUserId: string;
      displayName: string;
      avatar?: string | null;
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const session = readSessionCookie(request.headers.get("cookie"));

  if (!session?.refreshToken) {
    return NextResponse.redirect(new URL("/me?auth=expired", url));
  }

  try {
    const tokenData = await refreshSecondMeToken(session.refreshToken);
    const response = NextResponse.redirect(new URL("/me?auth=refreshed", url));

    response.cookies.set(
      AUTH_SESSION_COOKIE,
      serializeAuthSession({
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt: Date.now() + tokenData.expiresIn * 1000,
        scope: tokenData.scope ?? session.scope ?? [],
        secondMeUserId: session.secondMeUserId,
        displayName: session.displayName,
        avatar: session.avatar ?? null
      }),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: tokenData.expiresIn
      }
    );

    return response;
  } catch {
    const response = NextResponse.redirect(new URL("/me?auth=expired", url));
    response.cookies.set(AUTH_SESSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0
    });
    return response;
  }
}
