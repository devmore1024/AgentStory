"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getAppTabForPath, getNavigationPendingLabel, type AppTab } from "@/lib/app-navigation";

type NavigationIntent = {
  href?: string;
  label?: string;
  tab?: AppTab | null;
};

type PendingNavigationState = {
  label: string | null;
  tab: AppTab | null;
};

type NavigationTransitionContextValue = {
  pendingLabel: string | null;
  pendingTab: AppTab | null;
  beginNavigation: (intent: NavigationIntent | string) => void;
  clearNavigation: () => void;
};

const NavigationTransitionContext = createContext<NavigationTransitionContextValue | null>(null);

function isModifiedClick(event: React.MouseEvent<HTMLElement>) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

function isIgnoredHref(href: string) {
  return (
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("javascript:")
  );
}

function resolveIntent(intent: NavigationIntent | string): PendingNavigationState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const normalizedIntent = typeof intent === "string" ? { href: intent } : intent;
  const href = normalizedIntent.href?.trim();

  if (!href) {
    return normalizedIntent.label
      ? {
          label: normalizedIntent.label,
          tab: normalizedIntent.tab ?? null
        }
      : null;
  }

  let url: URL;

  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }

  if (url.origin !== window.location.origin) {
    return null;
  }

  if (url.pathname === window.location.pathname && url.search === window.location.search) {
    return null;
  }

  return {
    label: normalizedIntent.label ?? getNavigationPendingLabel(url.pathname),
    tab: normalizedIntent.tab ?? getAppTabForPath(url.pathname)
  };
}

function PendingNavigationToast({ label }: { label: string }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[5.5rem] z-[60] flex justify-center px-4 lg:bottom-6"
      data-testid="pending-navigation-toast"
    >
      <div className="inline-flex min-h-11 items-center gap-3 rounded-full border border-[rgba(95,127,98,0.18)] bg-[rgba(252,251,250,0.94)] px-4 py-3 text-sm font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-medium)] backdrop-blur">
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--accent-moss)] animate-pulse" />
        <span>{label}</span>
      </div>
    </div>
  );
}

export function NavigationTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);
  const [pendingNavigation, setPendingNavigation] = useState<PendingNavigationState>({
    label: null,
    tab: null
  });

  const clearNavigation = useCallback(() => {
    setPendingNavigation({
      label: null,
      tab: null
    });
  }, []);

  const beginNavigation = useCallback((intent: NavigationIntent | string) => {
    const resolvedIntent = resolveIntent(intent);

    if (!resolvedIntent) {
      return;
    }

    setPendingNavigation(resolvedIntent);
  }, []);

  const handleClickCapture = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.defaultPrevented || event.button !== 0 || isModifiedClick(event)) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");

      if (!href || isIgnoredHref(href)) {
        return;
      }

      beginNavigation({ href });
    },
    [beginNavigation]
  );

  useEffect(() => {
    if (pendingNavigation.label && previousPathnameRef.current !== pathname) {
      clearNavigation();
    }

    previousPathnameRef.current = pathname;
  }, [pathname, pendingNavigation.label, clearNavigation]);

  const contextValue = useMemo<NavigationTransitionContextValue>(
    () => ({
      pendingLabel: pendingNavigation.label,
      pendingTab: pendingNavigation.tab,
      beginNavigation,
      clearNavigation
    }),
    [pendingNavigation.label, pendingNavigation.tab, beginNavigation, clearNavigation]
  );

  return (
    <NavigationTransitionContext.Provider value={contextValue}>
      <div onClickCapture={handleClickCapture}>
        {children}
        {pendingNavigation.label ? <PendingNavigationToast label={pendingNavigation.label} /> : null}
      </div>
    </NavigationTransitionContext.Provider>
  );
}

export function useNavigationTransition() {
  const context = useContext(NavigationTransitionContext);

  if (!context) {
    throw new Error("useNavigationTransition must be used within NavigationTransitionProvider.");
  }

  return context;
}
