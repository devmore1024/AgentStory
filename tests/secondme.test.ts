import { afterEach, describe, expect, it, vi } from "vitest";
import { buildSecondMeAuthorizeUrl, getSecondMeRedirectUri } from "@/lib/secondme";

const ORIGINAL_ENV = {
  SECONDME_CLIENT_ID: process.env.SECONDME_CLIENT_ID,
  SECONDME_REDIRECT_URI: process.env.SECONDME_REDIRECT_URI,
  SECONDME_OAUTH_URL: process.env.SECONDME_OAUTH_URL,
  NEXT_PUBLIC_SECONDME_OAUTH_URL: process.env.NEXT_PUBLIC_SECONDME_OAUTH_URL
};

afterEach(() => {
  process.env.SECONDME_CLIENT_ID = ORIGINAL_ENV.SECONDME_CLIENT_ID;
  process.env.SECONDME_REDIRECT_URI = ORIGINAL_ENV.SECONDME_REDIRECT_URI;
  process.env.SECONDME_OAUTH_URL = ORIGINAL_ENV.SECONDME_OAUTH_URL;
  process.env.NEXT_PUBLIC_SECONDME_OAUTH_URL = ORIGINAL_ENV.NEXT_PUBLIC_SECONDME_OAUTH_URL;
  vi.unstubAllEnvs();
});

describe("secondme auth urls", () => {
  it("builds a callback uri from the current request origin when available", () => {
    expect(getSecondMeRedirectUri("http://localhost:3000")).toBe("http://localhost:3000/api/auth/callback");
  });

  it("falls back to the configured redirect uri when no request origin is provided", () => {
    process.env.SECONDME_REDIRECT_URI = "http://localhost:3001/api/auth/callback";

    expect(getSecondMeRedirectUri()).toBe("http://localhost:3001/api/auth/callback");
  });

  it("uses the current request origin in the authorize url", () => {
    process.env.SECONDME_CLIENT_ID = "client-id";
    process.env.SECONDME_OAUTH_URL = "https://second-me.cn/oauth/";

    const authUrl = new URL(buildSecondMeAuthorizeUrl("state-123", "http://localhost:3000"));

    expect(authUrl.origin).toBe("https://second-me.cn");
    expect(authUrl.pathname).toBe("/oauth/");
    expect(authUrl.searchParams.get("client_id")).toBe("client-id");
    expect(authUrl.searchParams.get("redirect_uri")).toBe("http://localhost:3000/api/auth/callback");
    expect(authUrl.searchParams.get("response_type")).toBe("code");
    expect(authUrl.searchParams.get("state")).toBe("state-123");
  });
});
