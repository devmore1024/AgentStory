type TokenResponse = {
  code: number;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    scope?: string[];
  };
};

type UserInfoResponse = {
  code: number;
  data: {
    userId: string;
    name: string;
    avatar?: string | null;
    bio?: string | null;
    selfIntroduction?: string | null;
    email?: string | null;
    route?: string | null;
  };
};

type ShadesResponse = {
  code: number;
  data: {
    shades?: Array<{
      shadeName?: string;
      shadeDescription?: string;
      shadeContent?: string;
      sourceTopics?: string[];
      confidenceLevel?: string;
    }>;
  };
};

type SoftMemoryResponse = {
  code: number;
  data: {
    list?: Array<{
      factObject?: string;
      factContent?: string;
    }>;
  };
};

export type SecondMeUserInfo = UserInfoResponse["data"];
export type SecondMeShade = NonNullable<ShadesResponse["data"]["shades"]>[number];
export type SecondMeSoftMemory = NonNullable<SoftMemoryResponse["data"]["list"]>[number];

function getAuthBaseUrl() {
  return process.env.NEXT_PUBLIC_SECONDME_OAUTH_URL || process.env.SECONDME_OAUTH_URL || "https://go.second.me/oauth/";
}

function getApiBaseUrl() {
  return process.env.SECONDME_API_BASE_URL || "https://app.mindos.com/gate/lab";
}

function getTokenEndpoint() {
  return process.env.SECONDME_TOKEN_ENDPOINT || `${getApiBaseUrl()}/api/oauth/token/code`;
}

function getRefreshEndpoint() {
  return process.env.SECONDME_REFRESH_ENDPOINT || `${getApiBaseUrl()}/api/oauth/token/refresh`;
}

export function buildSecondMeAuthorizeUrl(state: string) {
  const authUrl = new URL(getAuthBaseUrl());
  authUrl.searchParams.set("client_id", process.env.SECONDME_CLIENT_ID ?? "");
  authUrl.searchParams.set("redirect_uri", process.env.SECONDME_REDIRECT_URI ?? "");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);
  return authUrl.toString();
}

export async function exchangeSecondMeCode(code: string) {
  const formData = new URLSearchParams();
  formData.set("grant_type", "authorization_code");
  formData.set("code", code);
  formData.set("redirect_uri", process.env.SECONDME_REDIRECT_URI ?? "");
  formData.set("client_id", process.env.SECONDME_CLIENT_ID ?? "");
  formData.set("client_secret", process.env.SECONDME_CLIENT_SECRET ?? "");

  const response = await fetch(getTokenEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData.toString(),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`SecondMe token exchange failed: ${response.status}`);
  }

  const payload = (await response.json()) as TokenResponse;

  if (payload.code !== 0) {
    throw new Error(`SecondMe token exchange failed with code ${payload.code}`);
  }

  return payload.data;
}

export async function refreshSecondMeToken(refreshToken: string) {
  const formData = new URLSearchParams();
  formData.set("grant_type", "refresh_token");
  formData.set("refresh_token", refreshToken);
  formData.set("client_id", process.env.SECONDME_CLIENT_ID ?? "");
  formData.set("client_secret", process.env.SECONDME_CLIENT_SECRET ?? "");

  const response = await fetch(getRefreshEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData.toString(),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`SecondMe token refresh failed: ${response.status}`);
  }

  const payload = (await response.json()) as TokenResponse;

  if (payload.code !== 0) {
    throw new Error(`SecondMe token refresh failed with code ${payload.code}`);
  }

  return payload.data;
}

async function authorizedGet<T>(path: string, accessToken: string) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`SecondMe request failed: ${response.status} ${path}`);
  }

  return (await response.json()) as T;
}

export async function fetchSecondMeUserInfo(accessToken: string) {
  const payload = await authorizedGet<UserInfoResponse>("/api/secondme/user/info", accessToken);
  if (payload.code !== 0) {
    throw new Error(`Failed to fetch user info: ${payload.code}`);
  }
  return payload.data;
}

export async function fetchSecondMeShades(accessToken: string) {
  const payload = await authorizedGet<ShadesResponse>("/api/secondme/user/shades", accessToken);
  if (payload.code !== 0) {
    throw new Error(`Failed to fetch shades: ${payload.code}`);
  }
  return payload.data.shades ?? [];
}

export async function fetchSecondMeSoftMemory(accessToken: string) {
  const payload = await authorizedGet<SoftMemoryResponse>(
    "/api/secondme/user/softmemory?pageNo=1&pageSize=20",
    accessToken
  );
  if (payload.code !== 0) {
    throw new Error(`Failed to fetch soft memory: ${payload.code}`);
  }
  return payload.data.list ?? [];
}
