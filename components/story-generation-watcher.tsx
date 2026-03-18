"use client";

import { useEffect } from "react";
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
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      try {
        await fetch("/api/story-jobs/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            threadId
          }),
          cache: "no-store"
        });
      } catch {
        // Swallow client-side polling failures; the next refresh can retry.
      }

      if (cancelled) {
        return;
      }

      router.refresh();

      timer = setTimeout(() => {
        void tick();
      }, 4000);
    };

    void tick();

    return () => {
      cancelled = true;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [active, router, threadId]);

  return null;
}
