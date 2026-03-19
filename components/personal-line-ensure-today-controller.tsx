"use client";

import React, { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StateCard } from "@/components/state-card";

type PersonalLineEnsureTodayControllerProps = {
  slug: string;
  active: boolean;
  hasEpisodes: boolean;
};

export function PersonalLineEnsureTodayController({
  slug,
  active,
  hasEpisodes
}: PersonalLineEnsureTodayControllerProps) {
  const router = useRouter();
  const hasRequestedRef = useRef(false);
  const [isPreparing, setIsPreparing] = useState(false);

  useEffect(() => {
    if (!active || hasRequestedRef.current) {
      return;
    }

    hasRequestedRef.current = true;
    setIsPreparing(true);

    const abortController = new AbortController();

    const ensureToday = async () => {
      try {
        await fetch("/api/personal-lines/ensure-today", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            slug
          }),
          cache: "no-store",
          signal: abortController.signal
        });
      } catch {
        // Keep the current detail page usable even if the background ensure call fails.
      } finally {
        if (abortController.signal.aborted) {
          return;
        }

        setIsPreparing(false);
        startTransition(() => {
          router.refresh();
        });
      }
    };

    void ensureToday();

    return () => {
      abortController.abort();
    };
  }, [active, router, slug]);

  if (!active || !isPreparing) {
    return null;
  }

  return (
    <StateCard
      eyebrow="准备今日章节"
      title={hasEpisodes ? "正在准备今天的这一章" : "正在准备第一篇冒险"}
      description="我们会先确认今天是不是已经写过；如果还没有，就会自动把新的一章放进队列。页面会很快刷新。"
    />
  );
}
