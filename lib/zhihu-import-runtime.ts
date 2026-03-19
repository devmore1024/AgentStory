export const ZHIHU_OPENAPI_ACCESS_TOKEN_ENV_KEY = "ZHIHU_OPENAPI_ACCESS_TOKEN";

export const ZHIHU_OPENAPI_DEPRECATED_CREDENTIAL_ENV_KEYS = [
  "ZHIHU_OPENAPI_TOKEN",
  "ZHIHU_OPENAPI_API_KEY",
  "ZHIHU_OPENAPI_TOKEN_HEADER",
  "ZHIHU_OPENAPI_API_KEY_HEADER",
  "ZHIHU_OPENAPI_AUTH_SCHEME",
  "ZHIHU_OPENAPI_TOKEN_QUERY_PARAM",
  "ZHIHU_OPENAPI_API_KEY_QUERY_PARAM"
] as const;

export const ZHIHU_OPENAPI_RUNTIME_ENV_KEYS = [
  ZHIHU_OPENAPI_ACCESS_TOKEN_ENV_KEY,
  "ZHIHU_OPENAPI_SEARCH_URL",
  "ZHIHU_OPENAPI_SEARCH_QUERY_PARAM",
  "ZHIHU_OPENAPI_SEARCH_LIMIT",
  "ZHIHU_OPENAPI_SEARCH_LIMIT_PARAM",
  ...ZHIHU_OPENAPI_DEPRECATED_CREDENTIAL_ENV_KEYS
] as const;

function readNonEmptyEnvValue(env: Record<string, string | undefined>, key: string) {
  const value = env[key]?.trim();
  return value && value.length > 0 ? value : null;
}

export function resolveZhihuSearchAccessToken(env: Record<string, string | undefined>) {
  const accessToken = readNonEmptyEnvValue(env, ZHIHU_OPENAPI_ACCESS_TOKEN_ENV_KEY);

  if (accessToken) {
    return accessToken;
  }

  const deprecatedKeys = ZHIHU_OPENAPI_DEPRECATED_CREDENTIAL_ENV_KEYS.filter((key) =>
    Boolean(readNonEmptyEnvValue(env, key))
  );

  if (deprecatedKeys.length > 0) {
    throw new Error(
      `Missing ${ZHIHU_OPENAPI_ACCESS_TOKEN_ENV_KEY}. Found deprecated Zhihu credential env var(s): ${deprecatedKeys.join(", ")}. The Zhihu reference import only consumes an existing access token for /openapi/search/global; app credential vars are no longer accepted.`
    );
  }

  throw new Error(
    `Missing ${ZHIHU_OPENAPI_ACCESS_TOKEN_ENV_KEY}. The Zhihu reference import only consumes an existing access token for /openapi/search/global; obtain it outside the repo and inject it before running import:zhihu-refs.`
  );
}

export function buildZhihuSearchFailureMessage(params: {
  queryKeyword: string;
  status: number;
  details: string;
}) {
  const details = params.details.trim();
  const base = `Zhihu search failed for "${params.queryKeyword}": ${params.status}${details ? ` ${details}` : ""}`;

  if (params.status === 401 && /token not exist/i.test(details)) {
    return `${base}. /openapi/search/global requires a valid ${ZHIHU_OPENAPI_ACCESS_TOKEN_ENV_KEY}; deprecated app credential vars such as ZHIHU_OPENAPI_TOKEN and ZHIHU_OPENAPI_API_KEY are not accepted.`;
  }

  return base;
}
