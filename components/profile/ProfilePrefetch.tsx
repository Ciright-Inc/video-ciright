"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchProfileTab } from "@/lib/queries/profile-tab-cache";

const CACHED_TAB_HREFS = [
  "/profile",
  "/profile/history",
  "/profile/saved",
  "/profile/channel",
] as const;

/** Warms React Query caches for cached profile tabs once per session. */
export function ProfilePrefetch() {
  const queryClient = useQueryClient();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    for (const href of CACHED_TAB_HREFS) {
      prefetchProfileTab(queryClient, href);
    }
  }, [queryClient]);

  return null;
}
