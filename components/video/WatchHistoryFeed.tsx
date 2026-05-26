"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { HistoryVideoSections } from "./HistoryVideoSections";
import { RelatedVideoRowSkeleton } from "@/components/ui/skeleton";
import { groupWatchHistory } from "@/lib/profile/historyGroups";
import type { WatchHistoryPage } from "@/lib/profile/watchHistoryPage";
import {
  flattenWatchHistoryPages,
  useWatchHistoryInfinite,
} from "@/lib/queries/watch-history";

export function WatchHistoryFeed({
  initialPage,
}: {
  initialPage?: WatchHistoryPage;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useWatchHistoryInfinite(initialPage);

  const sections = useMemo(() => {
    const rows = flattenWatchHistoryPages(data?.pages).map((item) => ({
      watchedAt: new Date(item.watchedAt),
      video: item.video,
    }));
    return groupWatchHistory(rows).map((section) => ({
      label: section.label,
      items: section.rows.map((row) => ({
        video: row.video,
        contextDate: row.watchedAt,
        key: `${row.video.id}-${row.watchedAt.toISOString()}`,
      })),
    }));
  }, [data?.pages]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "240px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <HistoryVideoSections sections={sections} />
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      {isFetchingNextPage ? (
        <ul
          className="mt-4 flex flex-col gap-4"
          role="status"
          aria-busy="true"
          aria-label="Loading more watch history"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i}>
              <RelatedVideoRowSkeleton />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
