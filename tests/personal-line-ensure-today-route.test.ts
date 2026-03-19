import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  ensureTodayPersonalLine: vi.fn()
}));

class MockAuthRequiredError extends Error {}
class MockStoryExperienceMigrationError extends Error {}

vi.mock("@/lib/story-experience", () => ({
  AuthRequiredError: MockAuthRequiredError,
  StoryExperienceMigrationError: MockStoryExperienceMigrationError,
  ensureTodayPersonalLine: mocks.ensureTodayPersonalLine
}));

describe("personal line ensure-today route", () => {
  it("returns the existing personal line state when today's chapter already exists", async () => {
    const { POST } = await import("@/app/api/personal-lines/ensure-today/route");
    mocks.ensureTodayPersonalLine.mockResolvedValueOnce({
      threadId: "thread-1",
      episodeId: "episode-1",
      generationState: "idle"
    });

    const response = await POST(
      new Request("http://localhost:3000/api/personal-lines/ensure-today", {
        method: "POST",
        body: JSON.stringify({
          slug: "fairy-sleeping-beauty"
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      threadId: "thread-1",
      episodeId: "episode-1",
      generationState: "idle"
    });
  });

  it("returns queued state after enqueuing today's chapter", async () => {
    const { POST } = await import("@/app/api/personal-lines/ensure-today/route");
    mocks.ensureTodayPersonalLine.mockResolvedValueOnce({
      threadId: "thread-1",
      episodeId: "episode-2",
      generationState: "queued"
    });

    const response = await POST(
      new Request("http://localhost:3000/api/personal-lines/ensure-today", {
        method: "POST",
        body: JSON.stringify({
          slug: "fairy-sleeping-beauty"
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      threadId: "thread-1",
      episodeId: "episode-2",
      generationState: "queued"
    });
  });

  it("returns unauthorized when the viewer session is missing", async () => {
    const { POST } = await import("@/app/api/personal-lines/ensure-today/route");
    mocks.ensureTodayPersonalLine.mockRejectedValueOnce(new MockAuthRequiredError("Authentication is required."));

    const response = await POST(
      new Request("http://localhost:3000/api/personal-lines/ensure-today", {
        method: "POST",
        body: JSON.stringify({
          slug: "fairy-sleeping-beauty"
        })
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Authentication is required."
    });
  });

  it("returns migration required when the story schema is unavailable", async () => {
    const { POST } = await import("@/app/api/personal-lines/ensure-today/route");
    mocks.ensureTodayPersonalLine.mockRejectedValueOnce(
      new MockStoryExperienceMigrationError("Story experience schema is not ready.")
    );

    const response = await POST(
      new Request("http://localhost:3000/api/personal-lines/ensure-today", {
        method: "POST",
        body: JSON.stringify({
          slug: "fairy-sleeping-beauty"
        })
      })
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Story experience schema is not ready."
    });
  });
});
