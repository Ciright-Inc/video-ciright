"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchWatchHistoryPage } from "@/lib/api/watch-history";
import type { WatchHistoryPage } from "@/lib/profile/watchHistoryPage";
import { profileQueryOptions } from "@/lib/queries/profile-query-options";

export const watchHistoryKeys = {
  all: ["watch-history"] as const,
};

export function useWatchHistoryInfinite(initialPage?: WatchHistoryPage) {
  return useInfiniteQuery({
    queryKey: watchHistoryKeys.all,
    queryFn: ({ pageParam }) => fetchWatchHistoryPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    ...profileQueryOptions,
    ...(initialPage
      ? {
          initialData: { pages: [initialPage], pageParams: [1] },
          initialDataUpdatedAt: Date.now(),
        }
      : {}),
    placeholderData: (previousData) => previousData,
  });
}

export function flattenWatchHistoryPages(
  pages: WatchHistoryPage[] | undefined
): WatchHistoryPage["items"] {
  if (!pages) return [];
  return pages.flatMap((page) => page.items);
}
