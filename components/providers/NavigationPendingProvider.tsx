"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type NavigationPendingContextValue = {
  pendingHref: string | null;
  startNavigation: (href: string) => void;
};

const NavigationPendingContext =
  createContext<NavigationPendingContextValue | null>(null);

/** Normalizes app paths for comparison (pathname + optional search). */
export function normalizeAppHref(href: string): string {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    try {
      const url = new URL(href);
      return url.pathname + url.search;
    } catch {
      return href;
    }
  }
  if (!href.startsWith("/")) {
    return `/${href}`;
  }
  return href;
}

function pathnameOf(href: string): string {
  return normalizeAppHref(href).split("?")[0] ?? href;
}

export function isNavigationPending(
  pendingHref: string | null,
  pathname: string
): boolean {
  if (!pendingHref) return false;
  return pathnameOf(pendingHref) !== pathname;
}

export function isProfilePath(path: string): boolean {
  const normalized = pathnameOf(path);
  return normalized === "/profile" || normalized.startsWith("/profile/");
}

/** In-profile tab switches — chrome stays mounted; only page body skeletons. */
export function isProfileSubnavigation(
  pendingHref: string | null,
  pathname: string
): boolean {
  if (!pendingHref || !isNavigationPending(pendingHref, pathname)) return false;
  return isProfilePath(pathname) && isProfilePath(pendingHref);
}

export function NavigationPendingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const activePendingHref =
    pendingHref && pathnameOf(pendingHref) !== pathname ? pendingHref : null;

  const startNavigation = useCallback(
    (href: string) => {
      const target = normalizeAppHref(href);
      if (pathnameOf(target) !== pathname) {
        setPendingHref(target);
      }
    },
    [pathname]
  );

  const value = useMemo(
    () => ({ pendingHref: activePendingHref, startNavigation }),
    [activePendingHref, startNavigation]
  );

  return (
    <NavigationPendingContext.Provider value={value}>
      {children}
    </NavigationPendingContext.Provider>
  );
}

export function useNavigationPending() {
  const ctx = useContext(NavigationPendingContext);
  if (!ctx) {
    throw new Error(
      "useNavigationPending must be used within NavigationPendingProvider"
    );
  }
  return ctx;
}
