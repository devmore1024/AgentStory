import { describe, expect, it } from "vitest";
import {
  buildZhihuSearchRequest,
  buildZhihuSearchKeywords,
  dedupeAndSortZhihuCandidates,
  extractZhihuContentFromHtml,
  normalizeZhihuSearchCandidates,
  scoreZhihuSearchCandidate
} from "@/lib/zhihu-import";

describe("zhihu import helpers", () => {
  it("builds a small set of search keywords from title, source title and slug", () => {
    expect(
      buildZhihuSearchKeywords({
        title: "小红帽",
        slug: "fairy-little-red-riding-hood",
        sourceTitle: "Little Red Riding Hood"
      })
    ).toEqual(["小红帽", "Little Red Riding Hood", "little red riding hood"]);
  });

  it("builds a configurable zhihu search request with bearer auth", () => {
    const request = buildZhihuSearchRequest("https://openapi.zhihu.com/openapi/search/global", "小红帽", {
      accessToken: "access-token-1"
    });
    const requestUrl = new URL(request.url);

    expect(requestUrl.searchParams.get("keyword")).toBe("小红帽");
    expect(requestUrl.searchParams.get("limit")).toBe("10");
    expect(request.headers.Authorization).toBe("Bearer access-token-1");
    expect(request.headers["X-API-Key"]).toBeUndefined();
  });

  it("keeps search query configuration customizable without query-param auth", () => {
    const request = buildZhihuSearchRequest("https://openapi.zhihu.com/openapi/search/global", "小红帽", {
      accessToken: "access-token-2",
      searchQueryParam: "q",
      searchLimitParam: "page_size",
      searchLimit: 5
    });
    const requestUrl = new URL(request.url);

    expect(requestUrl.searchParams.get("q")).toBe("小红帽");
    expect(requestUrl.searchParams.get("page_size")).toBe("5");
    expect(requestUrl.searchParams.get("keyword")).toBeNull();
    expect(requestUrl.searchParams.get("access_token")).toBeNull();
    expect(request.headers.Authorization).toBe("Bearer access-token-2");
  });

  it("normalizes flexible search payloads into candidates", () => {
    const candidates = normalizeZhihuSearchCandidates(
      {
        data: [
          {
            type: "answer",
            title: "为什么小红帽总是会走进森林",
            excerpt: "<p>她并不是单纯天真，而是被故事结构推着走。</p>",
            url: "https://www.zhihu.com/question/1/answer/2",
            author: {
              name: "答主 A",
              headline: "童话研究者",
              authority_level: 4
            }
          }
        ]
      },
      "小红帽"
    );

    expect(candidates).toEqual([
      {
        queryKeyword: "小红帽",
        sourceType: "answer",
        title: "为什么小红帽总是会走进森林",
        excerpt: "她并不是单纯天真，而是被故事结构推着走。",
        sourceUrl: "https://www.zhihu.com/question/1/answer/2",
        authorName: "答主 A",
        authorHeadline: "童话研究者",
        authorityLevel: 4,
        qualityScore: scoreZhihuSearchCandidate({
          title: "为什么小红帽总是会走进森林",
          excerpt: "她并不是单纯天真，而是被故事结构推着走。",
          authorityLevel: 4,
          sourceUrl: "https://www.zhihu.com/question/1/answer/2"
        })
      }
    ]);
  });

  it("extracts long-form content from zhihu html", () => {
    const html = `
      <html>
        <body>
          <div class="RichContent-inner">
            <p>这不是一个单纯关于顺从的童话，而是一个关于“为什么每个人都默认她必须走进森林”的问题。</p>
            <p>当我们把叙事结构拆开来看，就会发现危险并不是突然发生，而是一路被礼貌、秩序和默认的规则推着成立。</p>
            <p>也正因为这样，小红帽真正缺的不是聪明，而是有人替她指出那套看起来无害的路径本身就有问题。</p>
          </div>
        </body>
      </html>
    `;

    expect(extractZhihuContentFromHtml(html)).toContain("叙事结构拆开来看");
  });

  it("dedupes duplicate urls and keeps the best scored candidates", () => {
    const sorted = dedupeAndSortZhihuCandidates([
      {
        queryKeyword: "小红帽",
        sourceType: "answer",
        title: "A",
        excerpt: "短",
        sourceUrl: "https://www.zhihu.com/question/1/answer/2",
        authorName: null,
        authorHeadline: null,
        authorityLevel: 1,
        qualityScore: 20
      },
      {
        queryKeyword: "小红帽",
        sourceType: "answer",
        title: "B",
        excerpt: "长一点的摘要",
        sourceUrl: "https://www.zhihu.com/question/1/answer/2",
        authorName: null,
        authorHeadline: null,
        authorityLevel: 4,
        qualityScore: 80
      },
      {
        queryKeyword: "小红帽",
        sourceType: "article",
        title: "C",
        excerpt: "另一篇",
        sourceUrl: "https://zhuanlan.zhihu.com/p/3",
        authorName: null,
        authorHeadline: null,
        authorityLevel: 3,
        qualityScore: 60
      }
    ]);

    expect(sorted).toHaveLength(2);
    expect(sorted[0].title).toBe("B");
    expect(sorted[1].title).toBe("C");
  });
});
