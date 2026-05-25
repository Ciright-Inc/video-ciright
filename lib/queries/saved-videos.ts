"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchSavedVideosPage } from "@/lib/api/saved-videos";
import type { SavedVideosPage } from "@/lib/profile/savedVideosPage";

export const savedVideosKeys = {
  all: ["saved-videos"] as const,
};

export function useSavedVideosInfinite(initialPage?: SavedVideosPage) {
  return useInfiniteQuery({
    queryKey: savedVideosKeys.all,
    queryFn: ({ pageParam }) => fetchSavedVideosPage(pageParam),
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

export function flattenSavedVideosPages(
  pages: SavedVideosPage[] | undefined
): SavedVideosPage["items"] {
  if (!pages) return [];
  return pages.flatMap((page) => page.items);
}
