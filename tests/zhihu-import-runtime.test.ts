import { describe, expect, it } from "vitest";
import {
  buildZhihuSearchFailureMessage,
  resolveZhihuSearchAccessToken
} from "@/lib/zhihu-import-runtime";

describe("zhihu import runtime helpers", () => {
  it("resolves a provided zhihu access token", () => {
    expect(
      resolveZhihuSearchAccessToken({
        ZHIHU_OPENAPI_ACCESS_TOKEN: "  access-token  "
      })
    ).toBe("access-token");
  });

  it("fails fast when only deprecated zhihu credential vars are present", () => {
    expect(() =>
      resolveZhihuSearchAccessToken({
        ZHIHU_OPENAPI_TOKEN: "legacy-token",
        ZHIHU_OPENAPI_API_KEY: "legacy-api-key"
      })
    ).toThrowError(
      /Missing ZHIHU_OPENAPI_ACCESS_TOKEN.*ZHIHU_OPENAPI_TOKEN, ZHIHU_OPENAPI_API_KEY.*app credential vars are no longer accepted/s
    );
  });

  it("fails fast when no zhihu access token is available", () => {
    expect(() => resolveZhihuSearchAccessToken({})).toThrowError(
      /Missing ZHIHU_OPENAPI_ACCESS_TOKEN.*only consumes an existing access token/
    );
  });

  it("adds an explicit access-token diagnostic for 401 token not exist", () => {
    expect(
      buildZhihuSearchFailureMessage({
        queryKeyword: "小红帽",
        status: 401,
        details: '{"error":{"code":101,"name":"AuthenticationError","message":"token not exist"}}'
      })
    ).toContain("requires a valid ZHIHU_OPENAPI_ACCESS_TOKEN");
  });
});
