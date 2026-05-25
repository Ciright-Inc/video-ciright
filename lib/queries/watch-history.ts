"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchWatchHistoryPage } from "@/lib/api/watch-history";
import type { WatchHistoryPage } from "@/lib/profile/watchHistoryPage";

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
    ...(initialPage
      ? {
          initialData: {
            pages: [initialPage],
            pageParams: [1],
          },
        }
      : {}),
  });
}

export function flattenWatchHistoryPages(
  pages: WatchHistoryPage[] | undefined
): WatchHistoryPage["items"] {
  if (!pages) return [];
  return pages.flatMap((page) => page.items);
}
