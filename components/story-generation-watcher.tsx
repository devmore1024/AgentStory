"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";

type StoryGenerationWatcherProps = {
  threadId: string;
  active: boolean;
};

export function StoryGenerationWatcher({ threadId, active }: StoryGenerationWatcherProps) {
  const router = useRouter();

  useEffect(() => {
    if (!active) {
      return;
    }

    let cancelled = false;
    let requestTimer: ReturnType<typeof setTimeout> | null = null;
    let progressTimer: ReturnType<typeof setTimeout> | null = null;
    let activeController: AbortController | null = null;

    const refreshPage = () => {
      if (cancelled) {
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    };

    const scheduleProgressRefresh = () => {
      progressTimer = setTimeout(() => {
        refreshPage();
        scheduleProgressRefresh();
      }, 1500);
    };

    const tick = async () => {
      activeController = new AbortController();

      progressTimer = setTimeout(() => {
        refreshPage();
        scheduleProgressRefresh();
      }, 250);

      try {
        await fetch("/api/story-jobs/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            threadId
          }),
          cache: "no-store",
          signal: activeController.signal
        });
      } catch {
        // Swallow client-side polling failures; the next refresh can retry.
      } finally {
        if (progressTimer) {
          clearTimeout(progressTimer);
          progressTimer = null;
        }
      }

      if (cancelled) {
        return;
      }

      refreshPage();

      requestTimer = setTimeout(() => {
        void tick();
      }, 4000);
    };

    void tick();

    return () => {
      cancelled = true;

      if (requestTimer) {
        clearTimeout(requestTimer);
      }

      if (progressTimer) {
        clearTimeout(progressTimer);
      }

      activeController?.abort();
    };
  }, [active, router, threadId]);

  return null;
}
