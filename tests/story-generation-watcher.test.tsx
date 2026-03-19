import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StoryGenerationWatcher } from "@/components/story-generation-watcher";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh
  })
}));

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve,
    reject
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  refresh.mockReset();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("StoryGenerationWatcher", () => {
  it("refreshes during a long-running processing request and again when it finishes", async () => {
    const firstRequest = createDeferred<Response>();
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => firstRequest.promise)
      .mockImplementation(() => new Promise<Response>(() => undefined));

    vi.stubGlobal("fetch", fetchMock);

    render(<StoryGenerationWatcher threadId="thread-1" active />);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(250);
    expect(refresh).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1500);
    expect(refresh).toHaveBeenCalledTimes(2);

    firstRequest.resolve(
      new Response(JSON.stringify({ processed: 1 }), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      })
    );

    await vi.advanceTimersByTimeAsync(0);
    expect(refresh).toHaveBeenCalledTimes(3);

    await vi.advanceTimersByTimeAsync(4000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not start polling when inactive", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<StoryGenerationWatcher threadId="thread-1" active={false} />);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });
});
