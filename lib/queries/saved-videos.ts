"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchSavedVideosPage } from "@/lib/api/saved-videos";
import type { SavedVideosPage } from "@/lib/profile/savedVideosPage";
import { INITIAL_DATA_UPDATED_AT } from "@/lib/queries/initial-data-timestamp";
import { profileQueryOptions } from "@/lib/queries/profile-query-options";

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
    ...profileQueryOptions,
    ...(initialPage
      ? {
          initialData: { pages: [initialPage], pageParams: [1] },
          initialDataUpdatedAt: INITIAL_DATA_UPDATED_AT,
        }
      : {}),
    placeholderData: (previousData) => previousData,
  });
}

export function flattenSavedVideosPages(
  pages: SavedVideosPage[] | undefined
): SavedVideosPage["items"] {
  if (!pages) return [];
  return pages.flatMap((page) => page.items);
}
